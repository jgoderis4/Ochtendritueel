/**
 * Traject voor de verkeerstegel: woonplaats → bestemming.
 * Coördinaten (lat, lon) van Oostduinkerke en Gistel.
 */
export const TRAFFIC_ROUTE = {
  from: { label: "Oostduinkerke", lat: 51.124, lon: 2.668 },
  to: { label: "Gistel", lat: 51.1556, lon: 2.9619 },
} as const;
