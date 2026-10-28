/**
 * Adapter-interfaces voor alle externe bronnen (D-003).
 * In v1 is er één implementatie: mock (duidelijk gemarkeerde voorbeelddata, D-004).
 * Later worden deze interfaces vervangen door echte koppelingen zonder de UI te herschrijven.
 *
 * Elke payload draagt `source: "mock" | "live"` zodat de UI altijd eerlijk kan tonen
 * of data echt is (briefing: "doe niet alsof voorbeelddata actueel zijn").
 */

export type DataSource = "mock" | "live";

export interface Sourced<T> {
  source: DataSource;
  /** Tijdstip van ophalen (epoch ms); null bij ontbrekende data. */
  fetchedAt: number | null;
  data: T | null;
}

/* --- Weer --- */
export interface WeatherNow {
  location: string;
  tempC: number;
  condition: string;
  rainChancePct: number;
  windText: string; // bv. "ZW 3 Bft · 18 km/u"
  /** Alleen voor Oostduinkerke gevuld. */
  sunrise?: string;
  sunset?: string;
  forecastText?: string; // "Max 19°C · Droog"
}

export interface WeatherAdapter {
  getWeather(location: "Oostduinkerke" | "Gistel"): Promise<Sourced<WeatherNow>>;
}

/* --- Verkeer --- */
export interface TrafficInfo {
  fromTo: string; // "Oostduinkerke → Gistel"
  via: string; // "E40 / N34"
  durationMin: number;
  distanceKm: number;
  flow: "vlot" | "druk" | "stilstaand";
  incidents: string[]; // files/ongevallen/werken
  /** Afgeleide uiterste vertrektijd, bv. "07:35". */
  leaveBy: string;
}

export interface TrafficAdapter {
  getTraffic(): Promise<Sourced<TrafficInfo>>;
}

/* --- Nieuws --- */
export type NewsSource = "HLN" | "De Tijd" | "Regionaal" | "Sporza";

export interface NewsItem {
  source: NewsSource;
  topic: string; // "Belgisch nieuws", "Economie", ...
  headline: string;
  summary: string; // 1–2 zinnen
}

export interface NewsAdapter {
  getHeadlines(): Promise<Sourced<NewsItem[]>>;
}

/* --- Afvalophaling --- */
export interface WasteInfo {
  address: string; // "Guldenzandstraat, Oostduinkerke"
  todayFractions: string[]; // leeg = geen ophaling vandaag
  /** Eerstvolgende ophaling wanneer er vandaag niets is. */
  next?: { date: string; fractions: string[]; putOutFrom?: string };
}

export interface WasteAdapter {
  getCollection(): Promise<Sourced<WasteInfo>>;
}

/* --- Muziek (Sonos + Spotify) --- */
export interface MusicState {
  speaker: string; // "Sonos Roam • Slaapkamer"
  playlist: string; // "Acoustic Morning"
  volumePct: number;
  playing: boolean;
}

export interface MusicAdapter {
  getState(): Promise<Sourced<MusicState>>;
  play(): Promise<void>;
  stop(): Promise<void>;
  setVolume(pct: number): Promise<void>;
}

/* --- Outlook (alleen bestemming/vertrektijd; NOOIT afspraakdetails — D-005) --- */
export interface CommuteOverride {
  /** Afgeleide bestemming voor vandaag, of null = standaardroute gebruiken. */
  destination: string | null;
}

export interface CalendarAdapter {
  /** Levert UITSLUITEND een bestemming; geen titel/deelnemers/details. */
  getCommuteOverride(): Promise<Sourced<CommuteOverride>>;
}

/* --- TV-aansturing (afhankelijk van model; nog onbevestigd — O-1) --- */
export interface TvAdapter {
  turnOn(): Promise<void>;
  turnOff(): Promise<void>;
  /** Of automatisch aan/uit überhaupt ondersteund wordt op dit toestel. */
  supportsPower(): boolean;
}

/** Bundel van alle adapters die de app gebruikt. */
export interface Adapters {
  weather: WeatherAdapter;
  traffic: TrafficAdapter;
  news: NewsAdapter;
  waste: WasteAdapter;
  music: MusicAdapter;
  calendar: CalendarAdapter;
  tv: TvAdapter;
}
