/**
 * Klok-/datumformattering voor de TV-schermen (nl-BE). Puur: `now` komt van buiten
 * (uit useRoutine), zodat server en client dezelfde functie gebruiken.
 */

const PLACEHOLDER_CLOCK = "—";
const PLACEHOLDER_DATE = "";

/** "07:02" — of "—" vóór client-mount (now === null). */
export function formatClock(now: number | null): string {
  if (now === null) return PLACEHOLDER_CLOCK;
  return new Date(now).toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "Vrijdag 24 mei" — of "" vóór client-mount. */
export function formatDate(now: number | null): string {
  if (now === null) return PLACEHOLDER_DATE;
  const s = new Date(now).toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Begroeting op basis van het uur. */
export function greeting(now: number | null): string {
  if (now === null) return "Goedemorgen";
  const h = new Date(now).getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}
