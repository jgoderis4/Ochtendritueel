/**
 * Weekplanning: per-dag overrides (datum → plan), lokaal bewaard.
 *
 * Per dag kun je afwijken van de standaardinstellingen:
 *  - `style`: andere muziekstijl dan de standaard;
 *  - `start`: ander start-uur (HH:MM) dan het werkdag/weekend-standaarduur;
 *  - `off`:   die dag NIET automatisch starten (uitslapen).
 *
 * Gedeeld tussen de Weekoverzicht-pagina (die de overrides schrijft) en de
 * AppProvider (die bij app-start de effectieve stijl van VANDAAG naar de server
 * stuurt). De weekpagina schrijft de override en stuurt een event uit;
 * AppProvider luistert en synct opnieuw.
 */

import type { MusicStyle } from "./types";

export const WEEKPLAN_KEY = "aura.weekplan.v1";
/** Same-tab signaal dat de weekplanning gewijzigd is (storage-event vuurt niet in dezelfde tab). */
export const WEEKPLAN_EVENT = "aura:weekplan-changed";

/** Override voor één dag. Alle velden optioneel: enkel wat afwijkt wordt bewaard. */
export interface DayPlan {
  style?: MusicStyle;
  /** Start-uur HH:MM, of weggelaten → standaarduur uit instellingen. */
  start?: string;
  /** True → die dag niet automatisch starten (uitslapen). */
  off?: boolean;
}

export type Weekplan = Record<string, DayPlan>;

/** Datumsleutel zoals de weekpagina die opslaat (identiek houden!). */
export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Sleutel voor vandaag (lokale middernacht → zelfde vorm als de weekpagina). */
export function todayKey(): string {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return ymd(t);
}

/**
 * Leest de weekplanning. Verdraagt het oude formaat (datum → stijl-string) en
 * migreert dat naar { style } zodat bestaande opslag blijft werken.
 */
export function readWeekplan(): Weekplan {
  try {
    const raw = localStorage.getItem(WEEKPLAN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DayPlan | MusicStyle>;
    const out: Weekplan = {};
    for (const [date, val] of Object.entries(parsed)) {
      out[date] = typeof val === "string" ? { style: val } : val;
    }
    return out;
  } catch {
    return {};
  }
}

/** Schrijft de weekplanning (lokaal + server) en seint AppProvider/andere tabs in. */
export function writeWeekplan(plan: Weekplan): void {
  try {
    localStorage.setItem(WEEKPLAN_KEY, JSON.stringify(plan));
    window.dispatchEvent(new Event(WEEKPLAN_EVENT));
  } catch {
    /* opslag niet beschikbaar */
  }
  // Naar de server zodat alle toestellen én de ochtend-planner op de Pi
  // dezelfde weekplanning gebruiken. Fire-and-forget (lokaal blijft leidend bij offline).
  void fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekplan: plan }),
  }).catch(() => {});
}

/**
 * Haalt de weekplanning van de server op en zet 'm in de lokale cache zodat
 * readWeekplan() meteen de gedeelde planning teruggeeft. Seint luisteraars in.
 */
export async function hydrateWeekplanFromServer(): Promise<void> {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { weekplan?: Weekplan };
    if (!data.weekplan) return;
    localStorage.setItem(WEEKPLAN_KEY, JSON.stringify(data.weekplan));
    window.dispatchEvent(new Event(WEEKPLAN_EVENT));
  } catch {
    /* server niet bereikbaar — lokale cache blijft gelden */
  }
}

/** Past één dag aan (merge) en bewaart. */
export function setDayPlan(date: string, patch: DayPlan): Weekplan {
  const plan = readWeekplan();
  const next = { ...plan, [date]: { ...plan[date], ...patch } };
  writeWeekplan(next);
  return next;
}

/** De stijl van vandaag: de per-dag-override indien aanwezig, anders de standaard. */
export function effectiveStyleForToday(fallback: MusicStyle): MusicStyle {
  return readWeekplan()[todayKey()]?.style ?? fallback;
}

/** Het effectieve start-uur voor een dag (override → anders het standaarduur). */
export function effectiveStartForDay(date: string, fallback: string): string {
  return readWeekplan()[date]?.start ?? fallback;
}

/** True als die dag bewust uitgezet is (uitslapen). */
export function isDayOff(date: string): boolean {
  return readWeekplan()[date]?.off === true;
}
