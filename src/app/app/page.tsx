import Link from "next/link";
import { MockBadge } from "@/components/MockBadge";

/**
 * Smartphone-bediening. In Stap 1 de basis met de vier bedieningsknoppen als
 * placeholder; koppeling aan de routine-kern en de volledige instellingen/
 * weekoverzicht/vakantie/test volgen in Stap 3.
 */
const CONTROLS = [
  { label: "Start mijn ochtendroutine nu", tone: "bg-amber text-canvas" },
  { label: "Pauzeer alles", tone: "bg-surface-2 text-text-high" },
  { label: "Stop alles", tone: "bg-surface-2 text-text-high" },
  { label: "Work-out overslaan", tone: "bg-surface-2 text-text-high" },
];

export default function AppPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-[var(--spacing-lg)] px-[var(--spacing-lg)] py-[var(--spacing-xl)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-label-lg font-semibold uppercase tracking-[0.06em] text-emerald">
            Aura · bediening
          </p>
          <h1 className="font-display text-headline-xl font-semibold text-text-high">
            Ochtendroutine
          </h1>
        </div>
        <MockBadge />
      </header>

      <section className="flex flex-col gap-[var(--spacing-sm)]">
        {CONTROLS.map((c) => (
          <button
            key={c.label}
            type="button"
            disabled
            className={`rounded-md ${c.tone} px-[var(--spacing-md)] py-4 text-left text-body-lg font-semibold opacity-80`}
          >
            {c.label}
          </button>
        ))}
      </section>

      <p className="text-label-md text-text-muted">
        Knoppen worden in Stap 3 aan de routine-kern gekoppeld (start/pauze/stop/
        overslaan). Instellingen, weekoverzicht, vakantiemodus en testfunctie volgen.
      </p>

      <Link
        href="/"
        className="text-label-lg font-semibold uppercase tracking-[0.06em] text-amber"
      >
        ← Terug
      </Link>
    </main>
  );
}
