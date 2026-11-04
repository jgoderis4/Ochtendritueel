/**
 * Gedeelde INSTELLINGEN + WEEKPLANNING op de SERVER (de Pi). Eén bron van
 * waarheid voor alle toestellen én voor de ochtend-planner op de Pi.
 *
 * Tot nu toe stonden instellingen enkel in localStorage (op de gsm) — onleesbaar
 * voor de server/Pi. Nu bewaart de server ze in een JSON-bestand, zodat:
 *  - alle toestellen dezelfde instellingen zien (via /api/settings);
 *  - de ochtend-planner (scripts/aura-scheduler.mjs) de starttijden en per-dag
 *    overrides (uitslapen, ander uur) kan lezen en de tv/routine op tijd start.
 *
 * Persistent in een bestand onder AURA_DATA_DIR (default: <cwd>/.data). Dat pad
 * wordt NIET door git/npm aangeraakt, dus instellingen overleven een her-build.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DEFAULT_SETTINGS, type Settings } from "./types";
import type { DayPlan, Weekplan } from "./weekplan";

export interface AuraConfig {
  settings: Settings;
  weekplan: Weekplan;
  /** False tot de server voor het eerst instellingen opslaat. Laat de app weten
   *  dat ze bestaande localStorage-instellingen één keer mag migreren. */
  initialized: boolean;
}

const DATA_DIR = process.env.AURA_DATA_DIR || join(process.cwd(), ".data");
const FILE = join(DATA_DIR, "config.json");

function load(): AuraConfig {
  try {
    const raw = readFileSync(FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<AuraConfig>;
    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      weekplan: parsed.weekplan ?? {},
      initialized: true,
    };
  } catch {
    return { settings: { ...DEFAULT_SETTINGS }, weekplan: {}, initialized: false };
  }
}

let config: AuraConfig = load();

function persist() {
  try {
    mkdirSync(dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(config, null, 2));
  } catch {
    /* schijf niet schrijfbaar — in-memory blijft gelden */
  }
}

export const serverSettings = {
  get(): AuraConfig {
    return config;
  },

  updateSettings(patch: Partial<Settings>): AuraConfig {
    config = { ...config, settings: { ...config.settings, ...patch }, initialized: true };
    persist();
    return config;
  },

  setWeekplan(plan: Weekplan): AuraConfig {
    config = { ...config, weekplan: plan, initialized: true };
    persist();
    return config;
  },

  setDayPlan(date: string, patch: DayPlan): AuraConfig {
    const weekplan = { ...config.weekplan, [date]: { ...config.weekplan[date], ...patch } };
    config = { ...config, weekplan, initialized: true };
    persist();
    return config;
  },
};
