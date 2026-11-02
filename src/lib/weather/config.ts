/**
 * Locaties voor de weerbron (Open-Meteo, gratis, geen API-sleutel).
 * Kust = Oostduinkerke (hoofdzaak, incl. zonsop/-ondergang); Gistel = bestemming.
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
} as const satisfies Record<string, WeatherLocationConfig>;

export type WeatherLocation = keyof typeof WEATHER_LOCATIONS;

/** IANA-tijdzone voor een locatie; valt terug op Europe/Brussels. */
export function timezoneFor(location: WeatherLocation): string {
  const loc: WeatherLocationConfig = WEATHER_LOCATIONS[location];
  return loc.timezone ?? "Europe/Brussels";
}
