import Link from "next/link";
import { MockBadge } from "@/components/MockBadge";

/**
 * TV-oppervlak (10-foot UI). In Stap 1 een basisframe dat de Aura-tokens en
 * fonts bevestigt. De drie schermen (welkom/dashboard/workout) volgen in Stap 2.
 */
export default function TvPage() {
  return (
    <div className="flex min-h-screen flex-col px-[var(--spacing-margin)] py-[var(--spacing-lg)]">
      {/* Kopbalk: klok + datum blijven altijd zichtbaar */}
      <header className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-[var(--spacing-md)]">
          <span className="tabular font-display text-display-clock font-bold leading-none text-amber">
            07:02
          </span>
          <span className="text-headline-md uppercase tracking-[0.04em] text-text-mid">
            Vrijdag 24 mei
          </span>
        </div>
        <MockBadge />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-[var(--spacing-md)] text-center">
        <p className="text-label-lg font-semibold uppercase tracking-[0.06em] text-text-mid">
          TV-dashboard · Fase 1
        </p>
        <h1 className="font-display text-display-lg font-semibold text-text-high">
          Basisframe actief
        </h1>
        <p className="max-w-2xl text-body-lg text-text-mid">
          Welkomstscherm, vast dashboard en workoutscherm worden in Stap 2
          gebouwd op dit frame, volgens het Aura-design.
        </p>
        <Link
          href="/"
          className="mt-[var(--spacing-md)] text-label-lg font-semibold uppercase tracking-[0.06em] text-amber"
        >
          ← Terug
        </Link>
      </div>
    </div>
  );
}
