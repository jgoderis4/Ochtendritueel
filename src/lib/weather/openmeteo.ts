/**
 * Live weer via Open-Meteo (gratis, geen sleutel). Draait server-side; client gaat
 * via /api/weather. Bij falen een discrete status (data: null), nooit verzonnen
 * waarden (D-004 / §9). 15 min gecachet.
 */

import type { Sourced, WeatherNow } from "@/lib/adapters/types";
import { WEATHER_LOCATIONS, timezoneFor, type WeatherLocation } from "./config";

const BASE = "https://api.open-meteo.com/v1/forecast";

/** WMO-weercode → korte NL-omschrijving. */
function conditionNl(code: number): string {
  if (code === 0) return "Helder";
  if (code === 1) return "Overwegend helder";
  if (code === 2) return "Half bewolkt";
  if (code === 3) return "Bewolkt";
  if (code === 45 || code === 48) return "Mist";
  if (code >= 51 && code <= 55) return "Motregen";
  if (code === 56 || code === 57) return "IJzelmotregen";
  if (code >= 61 && code <= 65) return "Regen";
  if (code === 66 || code === 67) return "IJzel";
  if (code >= 71 && code <= 75) return "Sneeuw";
  if (code === 77) return "Sneeuwkorrels";
  if (code >= 80 && code <= 82) return "Regenbuien";
  if (code === 85 || code === 86) return "Sneeuwbuien";
  if (code === 95) return "Onweer";
  if (code === 96 || code === 99) return "Onweer met hagel";
  return "Wisselend";
}

/** Windrichting in graden → NL 8-punts kompas. */
export function windDirNl(deg: number): string {
  const dirs = ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/** Windsnelheid (km/u) → Beaufort. */
export function beaufort(kmh: number): number {
  const limits = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117];
  for (let i = 0; i < limits.length; i++) if (kmh <= limits[i]) return i;
  return 12;
}

function hhmm(iso: string): string {
  const t = iso.split("T")[1] ?? "";
  return t.slice(0, 5);
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
    temperature_2m_max?: number[];
    precipitation_probability_max?: number[];
  };
}

/**
 * Laatst succesvol opgehaalde weerwaarde per locatie. Open-Meteo is af en toe kort
 * "overloaded"; dan tonen we de laatst bekende ECHTE waarde i.p.v. de tegel leeg te
 * maken (geen verzonnen data — enkel een iets oudere, reële meting).
 */
const lastGood = new Map<WeatherLocation, WeatherNow>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchWeather(location: WeatherLocation): Promise<Sourced<WeatherNow>> {
  const loc = WEATHER_LOCATIONS[location];
  const now = Date.now();
  const url = new URL(BASE);
  url.searchParams.set("latitude", String(loc.latitude));
  url.searchParams.set("longitude", String(loc.longitude));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m,wind_direction_10m");
  url.searchParams.set("daily", "sunrise,sunset,temperature_2m_max,precipitation_probability_max");
  url.searchParams.set("timezone", timezoneFor(location));
  url.searchParams.set("forecast_days", "1");

  // Tot 3 pogingen met korte backoff — vangt de tijdelijke "service overloaded" op.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { next: { revalidate: 900 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as OpenMeteoResponse & { error?: boolean };
      if (json.error) throw new Error("open-meteo error");
      const c = json.current;
      const d = json.daily;
      if (!c || c.temperature_2m == null) throw new Error("onvolledige data");

      const windKmh = c.wind_speed_10m ?? 0;
      const rainPct = d?.precipitation_probability_max?.[0] ?? 0;
      const tMax = d?.temperature_2m_max?.[0];

      const data: WeatherNow = {
        location: loc.label,
        tempC: Math.round(c.temperature_2m),
        condition: conditionNl(c.weather_code ?? -1),
        rainChancePct: rainPct,
        windText: `${windDirNl(c.wind_direction_10m ?? 0)} ${beaufort(windKmh)} Bft · ${Math.round(windKmh)} km/u`,
        sunrise: d?.sunrise?.[0] ? hhmm(d.sunrise[0]) : undefined,
        sunset: d?.sunset?.[0] ? hhmm(d.sunset[0]) : undefined,
        forecastText:
          tMax != null
            ? `Max ${Math.round(tMax)}°C · ${rainPct <= 20 ? "Droog" : "Kans op regen"}`
            : undefined,
      };

      lastGood.set(location, data);
      return { source: "live", fetchedAt: now, data };
    } catch {
      if (attempt < 2) await sleep(400 * (attempt + 1));
    }
  }

  // Open-Meteo faalt → terugval op MET Norway (andere gratis bron, geen sleutel).
  try {
    const { fetchWeatherMetNo } = await import("./metno");
    const alt = await fetchWeatherMetNo(location);
    if (alt) {
      lastGood.set(location, alt);
      return { source: "live", fetchedAt: now, data: alt };
    }
  } catch {
    /* ook de terugval faalde */
  }

  // Alles mislukt → laatst bekende echte waarde (indien aanwezig), anders leeg.
  return { source: "live", fetchedAt: now, data: lastGood.get(location) ?? null };
}
