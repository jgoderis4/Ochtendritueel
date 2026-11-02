/**
 * Huidig weer voor een reeks wereldsteden in één Open-Meteo-call (sleutelvrij).
 * Voedt de roterende "Elders in de wereld"-tegel. 15 min gecachet.
 */
import { WORLD_CITIES, wmoToText } from "@/lib/weather/world-cities";

export async function GET() {
  const lats = WORLD_CITIES.map((c) => c.lat).join(",");
  const lons = WORLD_CITIES.map((c) => c.lon).join(",");
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&current=temperature_2m,weather_code`;

  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const json = (await res.json()) as
      | { current?: { temperature_2m?: number; weather_code?: number } }[]
      | { current?: { temperature_2m?: number; weather_code?: number } };
    // Bij één locatie geeft Open-Meteo een object, bij meerdere een array.
    const arr = Array.isArray(json) ? json : [json];

    const cities = WORLD_CITIES.map((c, i) => {
      const cur = arr[i]?.current;
      const code = cur?.weather_code ?? 0;
      const { text, emoji } = wmoToText(code);
      return {
        name: c.name,
        country: c.country,
        tempC: cur?.temperature_2m != null ? Math.round(cur.temperature_2m) : null,
        condition: text,
        emoji,
      };
    }).filter((c) => c.tempC != null);

    // Open-Meteo gaf (bijna) niets terug → terugval op MET Norway.
    if (cities.length === 0) {
      const { fetchWorldMetNo } = await import("@/lib/weather/metno");
      return Response.json({ cities: await fetchWorldMetNo(WORLD_CITIES) });
    }

    return Response.json({ cities });
  } catch {
    // Open-Meteo faalde volledig → terugval op MET Norway.
    try {
      const { fetchWorldMetNo } = await import("@/lib/weather/metno");
      return Response.json({ cities: await fetchWorldMetNo(WORLD_CITIES) });
    } catch {
      return Response.json({ cities: [] });
    }
  }
}
