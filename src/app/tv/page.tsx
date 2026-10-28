import Link from "next/link";
import { TvHeader } from "@/components/tv/TvHeader";

/**
 * TV-hub (Fase 1): preview van de drie schermen in de routinevolgorde.
 * Dient tegelijk als "testscherm" om elk scherm los te bekijken (briefing §7.5).
 * In een latere stap rendert /tv automatisch het scherm van de huidige routinefase.
 */
const SCREENS = [
  { href: "/tv/welcome", phase: "00:00 – 01:00", title: "Welkomstscherm", desc: "Klok, datum, begroeting, weerbewuste boodschap, quote en muziekstart.", accent: "text-text-high" },
  { href: "/tv/dashboard", phase: "01:00 – 10:00", title: "Vast dashboard", desc: "Weer, verkeer, nieuws en afval in een vaste tegelindeling.", accent: "text-coastal" },
  { href: "/tv/workout", phase: "vanaf 10:00", title: "Workout", desc: "Oefenbeeld, instructie, per-oefening countdown en 30-min countdown.", accent: "text-emerald" },
];

export default function TvHub() {
  return (
    <div className="flex min-h-screen flex-col gap-12 px-14 py-8">
      <TvHeader phaseLabel="Preview" />

      <main className="flex flex-1 flex-col justify-center gap-8">
        <div>
          <p className="text-label-lg font-semibold uppercase tracking-[0.06em] text-amber">TV-schermen</p>
          <h1 className="font-display text-display-lg font-semibold text-text-high">Routinevolgorde</h1>
        </div>

        <div className="grid gap-7 lg:grid-cols-3">
          {SCREENS.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-surface/90 p-8 transition-colors hover:border-amber"
            >
              <span className="tabular text-label-md uppercase tracking-[0.04em] text-text-muted">
                {String(i + 1).padStart(2, "0")} · {s.phase}
              </span>
              <h2 className={`font-display text-headline-lg font-semibold ${s.accent}`}>{s.title}</h2>
              <p className="text-body-md text-text-mid">{s.desc}</p>
              <span className="mt-auto pt-3 text-label-lg font-semibold uppercase tracking-[0.06em] text-text-mid group-hover:text-amber">
                Bekijk →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="text-label-md text-text-muted">
        <Link href="/" className="font-semibold uppercase tracking-[0.06em] text-amber">← Terug naar start</Link>
      </footer>
    </div>
  );
}
