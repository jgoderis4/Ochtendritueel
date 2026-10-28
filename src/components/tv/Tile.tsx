import type { ReactNode } from "react";

/**
 * Dashboard-module (Aura): donkere tegel, uppercase micro-label + icoon in de kop,
 * optioneel een statuschip rechts. Vaste indeling, rounded-lg, ruime padding.
 */
export function Tile({
  label,
  icon,
  chip,
  children,
}: {
  label: string;
  icon?: ReactNode;
  chip?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface/90 p-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-text-mid">
          {icon}
          <h2 className="text-label-lg font-semibold uppercase tracking-[0.06em]">
            {label}
          </h2>
        </div>
        {chip}
      </header>
      {children}
    </section>
  );
}

/** Statuschip: pill met gekleurde stip + tekst. */
export function Chip({
  tone = "amber",
  children,
}: {
  tone?: "amber" | "emerald" | "coastal" | "muted";
  children: ReactNode;
}) {
  const dot = {
    amber: "bg-amber",
    emerald: "bg-emerald",
    coastal: "bg-coastal",
    muted: "bg-text-muted",
  }[tone];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-label-md font-medium text-text-mid">
      <span className={`size-2 rounded-full ${dot}`} aria-hidden />
      {children}
    </span>
  );
}

/** Klein inner-paneel binnen een tegel (bv. metric-blokjes). */
export function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-2/70 p-5">
      {children}
    </div>
  );
}
