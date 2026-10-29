/**
 * Adapter-selectie. Bronnen schakelen één voor één van mock → live zonder de UI
 * te herschrijven (D-003). Live: afvalkalender (Recycle!/Fost Plus), weer
 * (Open-Meteo) en nieuws (RSS/Atom). De rest blijft gemockt en als voorbeelddata
 * gelabeld (D-004).
 */
import type { Adapters } from "./types";
import { mockAdapters } from "./mock";
import { liveWasteAdapter } from "./live/waste";
import { liveWeatherAdapter } from "./live/weather";
import { liveNewsAdapter } from "./live/news";

export const ADAPTER_MODE = "mixed" as const;

export function getAdapters(): Adapters {
  return {
    ...mockAdapters,
    waste: liveWasteAdapter,
    weather: liveWeatherAdapter,
    news: liveNewsAdapter,
  };
}

export * from "./types";
