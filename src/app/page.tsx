import Link from "next/link";
import { MockBadge } from "@/components/MockBadge";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-[var(--spacing-xl)] px-[var(--spacing-lg)] py-[var(--spacing-xl)]">
      <header className="flex flex-col gap-[var(--spacing-sm)]">
        <p className="text-label-lg font-semibold uppercase tracking-[0.06em] text-amber">
          Aura
        </p>
        <h1 className="font-display text-display-lg font-semibold leading-tight text-text-high">
          Ochtendroutine
        </h1>
        <p className="max-w-xl text-body-lg text-text-mid">
          Rustig wakker worden met een vast TV-dashboard, muziek en een korte
          workout. Kies een oppervlak om te openen.
        </p>
        <div className="mt-[var(--spacing-sm)]">
          <MockBadge label="Fase 1 · voorbeelddata" />
        </div>
      </header>

      <nav className="grid gap-[var(--spacing-gutter)] sm:grid-cols-2">
        <SurfaceCard
          href="/tv"
          title="TV-dashboard"
          desc="Welkomstscherm → dashboard → workout. Voor de tv in de slaapkamer."
          accent="text-coastal"
        />
        <SurfaceCard
          href="/app"
          title="Smartphone-bediening"
          desc="Start, pauze, stop, instellingen, weekoverzicht en vakantiemodus."
          accent="text-emerald"
        />
      </nav>

      <footer className="text-label-md text-text-muted">
        Externe koppelingen (weer, verkeer, nieuws, afval, Sonos/Spotify, Outlook,
        tv) zijn in deze fase gemockt.
      </footer>
    </main>
  );
}

function SurfaceCard({
  href,
  title,
  desc,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-surface p-[var(--spacing-lg)] transition-colors hover:border-amber"
    >
      <h2 className={`font-display text-headline-lg font-semibold ${accent}`}>
        {title}
      </h2>
      <p className="mt-[var(--spacing-sm)] text-body-md text-text-mid">{desc}</p>
      <span className="mt-[var(--spacing-md)] inline-block text-label-lg font-semibold uppercase tracking-[0.06em] text-text-mid group-hover:text-amber">
        Openen →
      </span>
    </Link>
  );
}
