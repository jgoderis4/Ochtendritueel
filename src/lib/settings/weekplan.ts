/**
 * Weekplanning: per-dag muziekstijl-override (datum → stijl), lokaal bewaard.
 *
 * Gedeeld tussen de Weekoverzicht-pagina (die de overrides schrijft) en de
 * AppProvider (die bij app-start de stijl van VANDAAG naar de server stuurt,
 * zodat de routine-start echt die gekozen stijl afspeelt i.p.v. de algemene
 * standaard). De weekpagina schrijft de override en stuurt een event uit;
 * AppProvider luistert en synct de effectieve stijl opnieuw.
 */

import type { MusicStyle } from "./types";

export const WEEKPLAN_KEY = "aura.weekplan.v1";
/** Same-tab signaal dat de weekplanning gewijzigd is (storage-event vuurt niet in dezelfde tab). */
export const WEEKPLAN_EVENT = "aura:weekplan-changed";

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

export function readWeekplan(): Record<string, MusicStyle> {
  try {
    const raw = localStorage.getItem(WEEKPLAN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MusicStyle>) : {};
  } catch {
    return {};
  }
}

/** De stijl van vandaag: de per-dag-override indien aanwezig, anders de standaard. */
export function effectiveStyleForToday(fallback: MusicStyle): MusicStyle {
  return readWeekplan()[todayKey()] ?? fallback;
}
