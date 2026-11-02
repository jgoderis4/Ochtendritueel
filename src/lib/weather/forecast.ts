/**
 * Weekverwachting via Open-Meteo (gratis, geen sleutel). Draait server-side; client
 * gaat via /api/weather/forecast. Geeft tot 7 dagen met min/max, regenkans en een
 * korte omschrijving + emoji. Bij falen: lege lijst (nooit verzonnen data — D-004).
 */

import { WEATHER_LOCATIONS, timezoneFor, type WeatherLocation } from "./config";

const BASE = "https://api.open-meteo.com/v1/forecast";

export interface ForecastDay {
  /** ISO-datum (YYYY-MM-DD). */
  date: string;
  /** Korte NL dagnaam, bv. "ma". */
  dayLabel: string;
  tempMaxC: number;
  tempMinC: number;
  rainChancePct: number;
  condition: string;
  emoji: string;
}

/** WMO-weercode → korte NL-omschrijving. */
function conditionNl(code: number): string {
  if (code === 0) return "Helder";
  if (code === 1) return "Overw. helder";
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
  if (code === 96 || code === 99) return "Onweer + hagel";
  return "Wisselend";
}

/** WMO-weercode → emoji. */
function conditionEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code === 85 || code === 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

const DAY_LABELS = ["zo", "ma", "di", "wo", "do", "vr", "za"];

function dayLabelFor(iso: string): string {
  // iso = "YYYY-MM-DD" → lokale dagnaam zonder tijdzone-verschuiving.
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return DAY_LABELS[dt.getUTCDay()];
}

interface OpenMeteoDaily {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
    precipitation_probability_max?: number[];
  };
  error?: boolean;
}

/** Laatst succesvol opgehaalde weekverwachting (terugval bij tijdelijke uitval). */
const lastGood = new Map<WeatherLocation, ForecastDay[]>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchForecast(location: WeatherLocation): Promise<ForecastDay[]> {
  const loc = WEATHER_LOCATIONS[location];
  const url = new URL(BASE);
  url.searchParams.set("latitude", String(loc.latitude));
  url.searchParams.set("longitude", String(loc.longitude));
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
  );
  url.searchParams.set("timezone", timezoneFor(location));
  url.searchParams.set("forecast_days", "7");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as OpenMeteoDaily;
      if (json.error) throw new Error("open-meteo error");
      const d = json.daily;
      if (!d?.time?.length) throw new Error("onvolledige data");

      const days: ForecastDay[] = d.time.map((iso, i) => {
        const code = d.weather_code?.[i] ?? -1;
        return {
          date: iso,
          dayLabel: dayLabelFor(iso),
          tempMaxC: Math.round(d.temperature_2m_max?.[i] ?? 0),
          tempMinC: Math.round(d.temperature_2m_min?.[i] ?? 0),
          rainChancePct: d.precipitation_probability_max?.[i] ?? 0,
          condition: conditionNl(code),
          emoji: conditionEmoji(code),
        };
      });

      lastGood.set(location, days);
      return days;
    } catch {
      if (attempt < 2) await sleep(400 * (attempt + 1));
    }
  }

  return lastGood.get(location) ?? [];
}
