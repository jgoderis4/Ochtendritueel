/**
 * Dagelijkse dashboard-achtergrond: een mooie locatie die elke dag wisselt
 * (bergen, ski, exotische stranden, wereldsteden, natuur). Gecureerde lijst van
 * Unsplash-CDN-foto's (stabiele directe links, geen API-sleutel). Alle URL's zijn
 * vooraf getest op HTTP 200 + echte afbeelding.
 *
 * De keuze is deterministisch per kalenderdag → elk scherm/toestel toont dezelfde
 * achtergrond op dezelfde dag, en ze wisselt automatisch om middernacht.
 * Faalt een beeld toch (bv. geen internet op de Pi), dan valt de UI terug op een
 * gegarandeerd werkende Picsum-afbeelding en uiteindelijk op de effen canvas.
 */

export interface BackgroundImage {
  url: string;
  /** Korte NL-omschrijving van de locatie (caption op het dashboard). */
  name: string;
}

const BASE = "https://images.unsplash.com/photo-";
const PARAMS = "?w=1920&q=80&auto=format&fit=crop";

/** [foto-id, locatie/omschrijving] — zie testscript in de PR-historiek. */
const ENTRIES: [string, string][] = [
  ["1506905925346-21bda4d32df4", "Besneeuwde bergtoppen"],
  ["1519681393784-d120267933ba", "Sterrenhemel boven de bergen"],
  ["1483728642387-6c3bdd6c93e5", "Alpenmeer in de mist"],
  ["1464822759023-fed622ff2c3b", "Bergketen bij zonsopgang"],
  ["1491555103944-7c647fd857e6", "Dolomieten"],
  ["1454496522488-7a8e488e8606", "Noorderlicht"],
  ["1507525428034-b723cf961d3e", "Tropisch strand"],
  ["1544551763-46a013bb70d5", "Turquoise lagune"],
  ["1505228395891-9a51e7e86bf6", "Palmeiland"],
  ["1441974231531-c6227db76b6e", "Zonnig dennenbos"],
  ["1470071459604-3b5ec3a7fe05", "Mistig berglandschap"],
  ["1500534623283-312aade485b7", "Besneeuwd naaldbos"],
  ["1502082553048-f009c37129b9", "Herfstbos"],
  ["1518684079-3c830dcef090", "Dubai skyline"],
  ["1502602898657-3e91760cbb34", "Parijs bij nacht"],
  ["1513635269975-59663e0ac1ad", "Londen skyline"],
  ["1538485399081-7191377e8241", "Santorini"],
  ["1534351590666-13e3e96b5017", "New York skyline"],
  ["1496568816309-51d7c20e3b21", "San Francisco"],
  ["1518391846015-55a9cc003b25", "IJslands landschap"],
];

export const BACKGROUNDS: BackgroundImage[] = ENTRIES.map(([id, name]) => ({
  url: `${BASE}${id}${PARAMS}`,
  name,
}));

/** Dagnummer sinds epoch (UTC) → zelfde index op elk toestel op dezelfde dag. */
export function dayIndex(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

/** De achtergrond van vandaag (roteert dagelijks door de lijst). */
export function backgroundForDay(now: number = Date.now()): BackgroundImage {
  return BACKGROUNDS[dayIndex(now) % BACKGROUNDS.length];
}

/** Gegarandeerd werkende terugval (zelfde seed per dag → stabiel beeld). */
export function fallbackUrl(now: number = Date.now()): string {
  return `https://picsum.photos/seed/aura-${dayIndex(now)}/1920/1080`;
}
