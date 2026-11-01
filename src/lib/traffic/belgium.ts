/**
 * Algemeen filebeeld voor België via de TomTom Traffic Incidents API.
 * België is groter dan de maximale bbox (10.000 km²), dus we tegelen het land op
 * in stukken, vragen elk apart op en tellen de files (iconCategory 6) samen
 * (ontdubbeld op incident-id). Vereist TOMTOM_API_KEY (server-side).
 */

const KEY = process.env.TOMTOM_API_KEY ?? "";

/** Bounding box van België, opgedeeld in tegels van < 10.000 km². */
function belgiumTiles(): [number, number, number, number][] {
  const minLon = 2.5, maxLon = 6.4, minLat = 49.5, maxLat = 51.5;
  const lonStep = 0.78; // ~55 km op deze breedte
  const latStep = 1.0; // ~111 km → ~6.100 km² per tegel
  const tiles: [number, number, number, number][] = [];
  for (let lon = minLon; lon < maxLon; lon += lonStep) {
    for (let lat = minLat; lat < maxLat; lat += latStep) {
      tiles.push([
        +lon.toFixed(3),
        +lat.toFixed(3),
        +Math.min(lon + lonStep, maxLon).toFixed(3),
        +Math.min(lat + latStep, maxLat).toFixed(3),
      ]);
    }
  }
  return tiles;
}

interface Incident {
  properties?: { id?: string; iconCategory?: number; delay?: number };
}

async function jamsInTile(bbox: [number, number, number, number]): Promise<Incident[]> {
  const params = new URLSearchParams({
    key: KEY,
    bbox: bbox.join(","),
    fields: "{incidents{properties{id,iconCategory,delay}}}",
    language: "nl-NL",
    timeValidityFilter: "present",
    categoryFilter: "6", // alleen files
  });
  const res = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?${params}`, {
    next: { revalidate: 180 },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`TomTom incidents HTTP ${res.status}`);
  const json = (await res.json()) as { incidents?: Incident[] };
  return json.incidents ?? [];
}

export interface BelgiumTraffic {
  available: boolean;
  jams: number; // totaal aantal gemelde files
  significant: number; // files met noemenswaardige vertraging (≥ 5 min)
  level: "vlot" | "beperkt" | "druk" | "zwaar";
}

/** Drempel voor een "echte" file: minstens zoveel seconden vertraging. */
const DELAY_THRESHOLD = 300; // 5 min

export async function getBelgiumTraffic(): Promise<BelgiumTraffic> {
  if (!KEY) return { available: false, jams: 0, significant: 0, level: "vlot" };
  try {
    const results = await Promise.all(belgiumTiles().map((t) => jamsInTile(t)));
    // Ontdubbelen op incident-id (tegels overlappen aan de randen).
    const byId = new Map<string, Incident>();
    for (const inc of results.flat()) {
      const id = inc.properties?.id ?? Math.random().toString(36);
      byId.set(id, inc);
    }
    const all = [...byId.values()];
    const jams = all.length;
    // magnitudeOfDelay is onbetrouwbaar → tel op de werkelijke vertraging (delay).
    const significant = all.filter((i) => (i.properties?.delay ?? 0) >= DELAY_THRESHOLD).length;
    const level: BelgiumTraffic["level"] =
      significant === 0 ? "vlot" : significant <= 8 ? "beperkt" : significant <= 20 ? "druk" : "zwaar";
    return { available: true, jams, significant, level };
  } catch {
    return { available: false, jams: 0, significant: 0, level: "vlot" };
  }
}
