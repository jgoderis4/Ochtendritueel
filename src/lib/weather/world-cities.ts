/**
 * Steden voor de "Elders in de wereld"-tegel die om de 30 s rouleert.
 * Een mix van sfeervolle bestemmingen wereldwijd.
 */
export interface WorldCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const WORLD_CITIES: WorldCity[] = [
  { name: "Reykjavik", country: "IJsland", lat: 64.15, lon: -21.94 },
  { name: "New York", country: "VS", lat: 40.71, lon: -74.01 },
  { name: "Rio de Janeiro", country: "Brazilië", lat: -22.91, lon: -43.17 },
  { name: "Kaapstad", country: "Zuid-Afrika", lat: -33.92, lon: 18.42 },
  { name: "Marrakesh", country: "Marokko", lat: 31.63, lon: -7.99 },
  { name: "Tokio", country: "Japan", lat: 35.68, lon: 139.69 },
  { name: "Bangkok", country: "Thailand", lat: 13.76, lon: 100.5 },
  { name: "Sydney", country: "Australië", lat: -33.87, lon: 151.21 },
  { name: "Honolulu", country: "Hawaï", lat: 21.31, lon: -157.86 },
  { name: "Rovaniemi", country: "Lapland", lat: 66.5, lon: 25.73 },
];

/** WMO-weercode → korte NL-omschrijving + passend symbool. */
export function wmoToText(code: number): { text: string; emoji: string } {
  if (code === 0) return { text: "Helder", emoji: "☀️" };
  if (code <= 2) return { text: "Licht bewolkt", emoji: "🌤️" };
  if (code === 3) return { text: "Bewolkt", emoji: "☁️" };
  if (code <= 48) return { text: "Mist", emoji: "🌫️" };
  if (code <= 57) return { text: "Motregen", emoji: "🌦️" };
  if (code <= 67) return { text: "Regen", emoji: "🌧️" };
  if (code <= 77) return { text: "Sneeuw", emoji: "❄️" };
  if (code <= 82) return { text: "Buien", emoji: "🌧️" };
  if (code <= 86) return { text: "Sneeuwbuien", emoji: "🌨️" };
  return { text: "Onweer", emoji: "⛈️" };
}
