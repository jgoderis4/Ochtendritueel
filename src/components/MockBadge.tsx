/**
 * Toont eerlijk dat data voorbeelddata is (D-004). Gebruik overal waar een
 * mock-bron wordt getoond, tot de live-adapter bestaat en getest is.
 */
export function MockBadge({ label = "Voorbeelddata" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-[var(--spacing-xs)] rounded-full border border-border bg-surface-2 px-3 py-1 text-label-md font-medium uppercase tracking-[0.04em] text-text-mid">
      <span className="size-2 rounded-full bg-amber" aria-hidden />
      {label}
    </span>
  );
}
