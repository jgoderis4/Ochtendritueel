/**
 * Adapter-selectie. Bronnen schakelen één voor één van mock → live zonder de UI
 * te herschrijven (D-003). Live: afvalkalender (Recycle!/Fost Plus) en weer
 * (Open-Meteo). De rest blijft voorlopig gemockt en als voorbeelddata gelabeld (D-004).
 */
import type { Adapters } from "./types";
import { mockAdapters } from "./mock";
import { liveWasteAdapter } from "./live/waste";
import { liveWeatherAdapter } from "./live/weather";

export const ADAPTER_MODE = "mixed" as const;

export function getAdapters(): Adapters {
  return { ...mockAdapters, waste: liveWasteAdapter, weather: liveWeatherAdapter };
}

export * from "./types";
