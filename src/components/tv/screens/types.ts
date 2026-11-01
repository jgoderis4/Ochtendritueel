import type {
  MusicState,
  NewsItem,
  Sourced,
  TrafficInfo,
  WasteInfo,
  WeatherNow,
} from "@/lib/adapters/types";
import type { UseRoutine } from "@/lib/routine/useRoutine";

/**
 * Alle adapterdata die de TV-schermen tonen. Server-side opgehaald en als props
 * doorgegeven (geen client-fetch) → geen hydration-ruis, D-004-labels blijven.
 */
export interface TvData {
  kust: Sourced<WeatherNow>;
  bestemming: Sourced<WeatherNow>;
  /** Sfeervolle droombestemmingen (Côte d'Azur, New York, …). */
  dreams: Sourced<WeatherNow>[];
  traffic: Sourced<TrafficInfo>;
  news: Sourced<NewsItem[]>;
  waste: Sourced<WasteInfo>;
  music: Sourced<MusicState>;
}

/** Elk scherm krijgt de data + de live routine-afleiding (één klokbron per pagina). */
export interface ScreenProps {
  data: TvData;
  routine: UseRoutine;
}
