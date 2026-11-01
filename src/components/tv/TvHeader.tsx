import { formatClock, formatDate } from "@/lib/routine/clock";

/**
 * Vaste TV-kopbalk: grote klok + datum blijven tijdens het hele dashboard
 * zichtbaar (briefing §4), met de routinestatus. Geen navigatiemenu: de tv is
 * een passief kioskscherm dat zichzelf doorschakelt (geen losse subpagina's).
 *
 * Live: geef `now` (epoch ms) door — klok/datum worden dan live afgeleid.
 * Vóór client-mount is `now` null → neutrale placeholder (geen hydration-ruis).
 * Zonder `now` gelden de (statische) defaults, handig voor de preview-hub.
 */
export function TvHeader({
  clock,
  date,
  now,
  phaseLabel,
}: {
  clock?: string;
  date?: string;
  now?: number | null;
  phaseLabel?: string;
}) {
  const showClock = now !== undefined ? formatClock(now) : clock ?? "07:02";
  const showDate = now !== undefined ? formatDate(now) : date ?? "Vrijdag 24 mei";

  return (
    <header className="flex items-center justify-between gap-8">
      <div className="flex items-baseline gap-5">
        <span className="tabular font-display text-6xl font-bold leading-none text-amber">
          {showClock}
        </span>
        <span className="text-label-lg uppercase tracking-[0.06em] text-text-mid">
          {showDate}
        </span>
      </div>

      {phaseLabel && (
        <div className="flex items-center gap-5">
          <span className="hidden text-label-md uppercase tracking-[0.04em] text-text-mid md:inline">
            Fase: <span className="text-text-high">{phaseLabel}</span>
          </span>
        </div>
      )}
    </header>
  );
}
