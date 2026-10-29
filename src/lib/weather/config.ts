/**
 * Locaties voor de weerbron (Open-Meteo, gratis, geen API-sleutel).
 * Kust = Oostduinkerke; bestemming = Gistel (incl. zonsop/-ondergang voor de kust).
 */
export const WEATHER_LOCATIONS = {
  Oostduinkerke: { label: "Oostduinkerke (Kust)", latitude: 51.124, longitude: 2.668 },
  Gistel: { label: "Gistel (Bestemming)", latitude: 51.1556, longitude: 2.9619 },
} as const;

export type WeatherLocation = keyof typeof WEATHER_LOCATIONS;
