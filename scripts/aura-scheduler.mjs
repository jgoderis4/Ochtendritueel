/**
 * Aura ochtend-planner (draait op de Pi als systemd-service).
 *
 * Elke 30 s leest hij de gedeelde instellingen + weekplanning van de app
 * (/api/settings) en beslist of de routine nú moet starten:
 *   - start-uur = per-dag override (weekplanning) óf standaard weekdag/weekend;
 *   - "uitslapen" (per-dag off) en vakantie → die dag niet starten;
 *   - op de starttijd: tv aan (CEC) + routine starten (/api/routine);
 *   - "tv uit op einde" → tv in standby na de maximale routineduur.
 *
 * Zo volgt de Pi automatisch wat jij in de app instelt — geen vaste tijden in cron.
 *
 * Env (met defaults):
 *   AURA_URL   = http://127.0.0.1:3000
 *   TV_ON_CMD  = /home/jgoderis/tv-aan.sh
 *   TV_OFF_CMD = /home/jgoderis/tv-uit.sh
 *   STATE_FILE = <cwd>/.data/scheduler-state.json
 */

import { execFile } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const AURA_URL = process.env.AURA_URL || "http://127.0.0.1:3000";
const TV_ON_CMD = process.env.TV_ON_CMD || "/home/jgoderis/tv-aan.sh";
const TV_OFF_CMD = process.env.TV_OFF_CMD || "/home/jgoderis/tv-uit.sh";
const STATE_FILE = process.env.STATE_FILE || join(process.cwd(), ".data", "scheduler-state.json");
const TICK_MS = 30_000;

function log(...a) {
  console.log(new Date().toISOString(), ...a);
}

/** Lokale datum als YYYY-MM-DD (zelfde vorm als de app). */
function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveState(s) {
  try {
    mkdirSync(dirname(STATE_FILE), { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(s));
  } catch (e) {
    log("kon state niet bewaren:", e.message);
  }
}

function runCmd(cmd, label) {
  execFile("/bin/bash", [cmd], (err) => {
    if (err) log(`${label} FOUT:`, err.message);
    else log(`${label} OK (${cmd})`);
  });
}

async function setMusic(style, volume) {
  try {
    const res = await fetch(`${AURA_URL}/api/music`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setPrefs", style, volume }),
    });
    log(`muziekstijl gezet → ${style} (vol ${volume}) [${res.status}]`);
  } catch (e) {
    log("setPrefs FOUT:", e.message);
  }
}

async function startRoutine() {
  try {
    const res = await fetch(`${AURA_URL}/api/routine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", now: Date.now() }),
    });
    log("routine start →", res.status);
  } catch (e) {
    log("routine start FOUT:", e.message);
  }
}

async function tick() {
  let config;
  try {
    const res = await fetch(`${AURA_URL}/api/settings`, { cache: "no-store" });
    if (!res.ok) return;
    config = await res.json();
  } catch {
    return; // app nog niet beschikbaar
  }

  const settings = config.settings ?? {};
  const weekplan = config.weekplan ?? {};
  const now = new Date();
  const key = todayKey(now);
  const dow = now.getDay(); // 0 = zondag, 6 = zaterdag
  const weekend = dow === 0 || dow === 6;

  let state = loadState();
  // Nieuwe dag → state resetten.
  if (state.date !== key) {
    state = { date: key, started: false, tvOff: false };
    saveState(state);
  }

  const day = weekplan[key] || {};

  // Uitslapen of vakantie → vandaag niet automatisch starten.
  const vac = settings.vacation || {};
  const inVacation =
    vac.enabled && vac.from && vac.to && key >= vac.from && key <= vac.to;
  const off = day.off === true || inVacation;

  // Effectief start-uur: per-dag override, anders standaard weekdag/weekend.
  const startHHMM = day.start || (weekend ? settings.startWeekend : settings.startWeekday);

  if (!off && startHHMM && !state.started) {
    const [h, m] = startHHMM.split(":").map(Number);
    const startAt = new Date(now);
    startAt.setHours(h, m, 0, 0);
    // Binnen een venster van 2 min na de starttijd afvuren (robuust tegen tick-gaten).
    const diff = now - startAt;
    if (diff >= 0 && diff < 120_000) {
      // Muziekstijl van de dag heeft prioriteit: per-dag override → anders standaard.
      const style = day.style || settings.musicStyle || "mix";
      const volume = typeof settings.volume === "number" ? settings.volume : 50;
      log(`Start! (${key} ${startHHMM}${day.start ? " [per-dag uur]" : ""}, muziek ${style}${day.style ? " [per-dag]" : ""})`);
      runCmd(TV_ON_CMD, "tv-aan");
      await setMusic(style, volume);
      await startRoutine();
      state.started = true;
      state.startEpoch = startAt.getTime();
      saveState(state);
    }
  }

  // Tv uit op het einde (na de maximale routineduur), indien ingesteld.
  if (state.started && !state.tvOff && settings.turnOffTvAtEnd) {
    const maxMs = (settings.maxDurationMin || 30) * 60_000;
    const base = state.startEpoch || Date.now();
    if (Date.now() >= base + maxMs) {
      log("Einde routine → tv uit");
      runCmd(TV_OFF_CMD, "tv-uit");
      state.tvOff = true;
      saveState(state);
    }
  }
}

log(`Aura-planner gestart. API=${AURA_URL}, tick=${TICK_MS}ms`);
tick();
setInterval(tick, TICK_MS);
