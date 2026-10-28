/**
 * Adapter-selectie. Bronnen schakelen één voor één van mock → live zonder de UI
 * te herschrijven (D-003). Live sinds Stap 5: afvalkalender (Recycle!/Fost Plus).
 * De rest blijft voorlopig gemockt en als voorbeelddata gelabeld (D-004).
 */
import type { Adapters } from "./types";
import { mockAdapters } from "./mock";
import { liveWasteAdapter } from "./live/waste";

export const ADAPTER_MODE = "mixed" as const;

export function getAdapters(): Adapters {
  return { ...mockAdapters, waste: liveWasteAdapter };
}

export * from "./types";
