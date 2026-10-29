/**
 * Adapter-selectie. Bronnen schakelen één voor één van mock → live zonder de UI
 * te herschrijven (D-003). Live: afvalkalender (Recycle!/Fost Plus), weer
 * (Open-Meteo), nieuws (RSS/Atom) en verkeer (OSRM, optioneel TomTom). Nog mock:
 * muziek, agenda, tv (D-004).
 */
import type { Adapters } from "./types";
import { mockAdapters } from "./mock";
import { liveWasteAdapter } from "./live/waste";
import { liveWeatherAdapter } from "./live/weather";
import { liveNewsAdapter } from "./live/news";
import { liveTrafficAdapter } from "./live/traffic";

export const ADAPTER_MODE = "mixed" as const;

export function getAdapters(): Adapters {
  return {
    ...mockAdapters,
    waste: liveWasteAdapter,
    weather: liveWeatherAdapter,
    news: liveNewsAdapter,
    traffic: liveTrafficAdapter,
  };
}

export * from "./types";
