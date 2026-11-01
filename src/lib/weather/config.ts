/**
 * Locaties voor de weerbron (Open-Meteo, gratis, geen API-sleutel).
 * Kust = Oostduinkerke (hoofdzaak, incl. zonsop/-ondergang); Gistel = bestemming.
 * Daarnaast een ruime pool "droombestemmingen" wereldwijd; elke dag worden er twee
 * getoond die dagelijks rouleren. Elke droombestemming heeft tijdzone "auto" zodat
 * de dag-/zonwaarden lokaal kloppen.
 */
export interface WeatherLocationConfig {
  label: string;
  latitude: number;
  longitude: number;
  /** IANA-tijdzone voor dag-/zonwaarden; standaard Europe/Brussels. */
  timezone?: string;
}

export const WEATHER_LOCATIONS = {
  // --- Echt (dagelijks gebruik) ---
  Oostduinkerke: { label: "Oostduinkerke (Kust)", latitude: 51.124, longitude: 2.668 },
  Gistel: { label: "Gistel (Bestemming)", latitude: 51.1556, longitude: 2.9619 },
  // --- Droombestemmingen (sfeervolle aanvulling, rouleren per dag) ---
  CoteDAzur: { label: "Côte d'Azur", latitude: 43.7102, longitude: 7.262, timezone: "auto" },
  NewYork: { label: "New York", latitude: 40.7128, longitude: -74.006, timezone: "auto" },
  Bali: { label: "Bali", latitude: -8.4095, longitude: 115.1889, timezone: "auto" },
  Kaapstad: { label: "Kaapstad", latitude: -33.9249, longitude: 18.4241, timezone: "auto" },
  Tokio: { label: "Tokio", latitude: 35.6762, longitude: 139.6503, timezone: "auto" },
  Reykjavik: { label: "Reykjavík", latitude: 64.1466, longitude: -21.9426, timezone: "auto" },
  Dubai: { label: "Dubai", latitude: 25.2048, longitude: 55.2708, timezone: "auto" },
  Sydney: { label: "Sydney", latitude: -33.8688, longitude: 151.2093, timezone: "auto" },
  Rio: { label: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729, timezone: "auto" },
  Marrakech: { label: "Marrakech", latitude: 31.6295, longitude: -7.9811, timezone: "auto" },
  Santorini: { label: "Santorini", latitude: 36.3932, longitude: 25.4615, timezone: "auto" },
  Zermatt: { label: "Zermatt (Alpen)", latitude: 46.0207, longitude: 7.7491, timezone: "auto" },
  Honolulu: { label: "Honolulu (Hawaï)", latitude: 21.3069, longitude: -157.8583, timezone: "auto" },
  Lapland: { label: "Lapland", latitude: 66.5039, longitude: 25.7294, timezone: "auto" },
  Venetie: { label: "Venetië", latitude: 45.4408, longitude: 12.3155, timezone: "auto" },
  Queenstown: { label: "Queenstown (NZ)", latitude: -45.0312, longitude: 168.6626, timezone: "auto" },
  Banff: { label: "Banff (Canada)", latitude: 51.1784, longitude: -115.5708, timezone: "auto" },
  Singapore: { label: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "auto" },
} as const satisfies Record<string, WeatherLocationConfig>;

export type WeatherLocation = keyof typeof WEATHER_LOCATIONS;

/** De pool droombestemmingen waaruit per dag geroteerd wordt. */
export const DREAM_POOL: WeatherLocation[] = [
  "CoteDAzur", "NewYork", "Bali", "Kaapstad", "Tokio", "Reykjavik",
  "Dubai", "Sydney", "Rio", "Marrakech", "Santorini", "Zermatt",
  "Honolulu", "Lapland", "Venetie", "Queenstown", "Banff", "Singapore",
];

/**
 * De twee droombestemmingen van vandaag — rouleren dagelijks door de pool, zodat
 * je elke dag andere plekken ziet (zelfde keuze op elk toestel op dezelfde dag).
 */
export function dreamsForDay(now: number = Date.now()): WeatherLocation[] {
  const day = Math.floor(now / 86_400_000);
  const n = DREAM_POOL.length; // even → de twee indices zijn altijd verschillend
  return [DREAM_POOL[(day * 2) % n], DREAM_POOL[(day * 2 + 1) % n]];
}
