/**
 * Locaties voor de weerbron (Open-Meteo, gratis, geen API-sleutel).
 * Kust = Oostduinkerke (hoofdzaak, incl. zonsop/-ondergang); Gistel = bestemming.
 * Daarnaast enkele "droombestemmingen" als sfeervolle aanvulling (Côte d'Azur,
 * New York). Die hebben een eigen tijdzone zodat de dagwaarden lokaal kloppen.
 */
export interface WeatherLocationConfig {
  label: string;
  latitude: number;
  longitude: number;
  /** IANA-tijdzone voor dag-/zonwaarden; standaard Europe/Brussels. */
  timezone?: string;
}

export const WEATHER_LOCATIONS = {
  Oostduinkerke: { label: "Oostduinkerke (Kust)", latitude: 51.124, longitude: 2.668 },
  Gistel: { label: "Gistel (Bestemming)", latitude: 51.1556, longitude: 2.9619 },
  CoteDAzur: { label: "Côte d'Azur", latitude: 43.7102, longitude: 7.262, timezone: "auto" },
  NewYork: { label: "New York", latitude: 40.7128, longitude: -74.006, timezone: "auto" },
} as const satisfies Record<string, WeatherLocationConfig>;

export type WeatherLocation = keyof typeof WEATHER_LOCATIONS;

/** De droombestemmingen (aanvulling naast het echte kust-/bestemmingweer). */
export const DREAM_LOCATIONS: WeatherLocation[] = ["CoteDAzur", "NewYork"];
