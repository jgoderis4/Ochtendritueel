import Link from "next/link";
import { MockBadge } from "@/components/MockBadge";

/**
 * Vaste TV-kopbalk: grote klok + datum blijven tijdens het hele dashboard
 * zichtbaar (briefing §4), met een subtiele navigatie en routinestatus.
 * Klok/datum zijn in Fase 1 statische voorbeeldwaarden.
 */
export function TvHeader({
  clock = "07:02",
  date = "Vrijdag 24 mei",
  phaseLabel,
}: {
  clock?: string;
  date?: string;
  phaseLabel?: string;
}) {
  return (
    <header className="flex items-center justify-between gap-8">
      <div className="flex items-baseline gap-5">
        <span className="tabular font-display text-6xl font-bold leading-none text-amber">
          {clock}
        </span>
        <span className="text-label-lg uppercase tracking-[0.06em] text-text-mid">
          {date}
        </span>
      </div>

      <nav className="hidden items-center gap-7 text-label-lg font-semibold uppercase tracking-[0.04em] text-text-mid lg:flex">
        <span className="rounded-full bg-amber px-4 py-1.5 text-canvas">
          Overzicht
        </span>
        <Link href="/tv/workout" className="hover:text-text-high">
          Routine
        </Link>
        <span className="hover:text-text-high">Kust &amp; Weer</span>
        <span className="hover:text-text-high">Audio</span>
      </nav>

      <div className="flex items-center gap-5">
        {phaseLabel && (
          <span className="hidden text-label-md uppercase tracking-[0.04em] text-text-mid md:inline">
            Fase: <span className="text-text-high">{phaseLabel}</span>
          </span>
        )}
        <MockBadge />
      </div>
    </header>
  );
}
