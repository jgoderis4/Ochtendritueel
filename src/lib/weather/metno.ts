/**
 * Terugval-weerbron: MET Norway (api.met.no, gratis, geen sleutel — wel een
 * verplichte User-Agent). Wordt gebruikt wanneer Open-Meteo (tijdelijk) faalt,
 * zodat de weertegel niet leeg blijft. Zelfde WeatherNow-vorm als Open-Meteo.
 *
 * Zonsop-/ondergang berekenen we lokaal (NOAA-formule) i.p.v. een extra API-call;
 * ±1 min nauwkeurig is ruim voldoende voor een dashboard.
 */

import type { WeatherNow } from "@/lib/adapters/types";
import type { WeatherLocation } from "./config";
import { WEATHER_LOCATIONS } from "./config";
import { beaufort, windDirNl } from "./openmeteo";

const BASE = "https://api.met.no/weatherapi/locationforecast/2.0/compact";
// MET.no vereist een identificeerbare User-Agent (anders 403).
const UA = "AuraMorningRoutine/1.0 github.com/jgoderis4/Ochtendritueel";

/** MET.no symbol_code → korte NL-omschrijving. */
function symbolNl(code: string | undefined): string {
  if (!code) return "Wisselend";
  const c = code.replace(/_(day|night|polartwilight)$/, "");
  if (c === "clearsky") return "Helder";
  if (c === "fair") return "Overwegend helder";
  if (c === "partlycloudy") return "Half bewolkt";
  if (c === "cloudy") return "Bewolkt";
  if (c === "fog") return "Mist";
  if (c.includes("thunder")) return "Onweer";
  if (c.includes("sleet")) return "Natte sneeuw";
  if (c.includes("snow")) return "Sneeuw";
  if (c.includes("heavyrain")) return "Zware regen";
  if (c.includes("lightrain") || c.includes("lightrainshowers")) return "Lichte regen";
  if (c.includes("rain")) return "Regen";
  return "Wisselend";
}

/** "HH:MM" van een UTC-ms-tijdstip, weergegeven in de opgegeven tijdzone. */
function hhmmInTz(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("nl-BE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

/**
 * Zonsopgang/-ondergang (UTC-ms) via de klassieke NOAA-benadering.
 * `rise=true` → opkomst, anders ondergang. null wanneer de zon niet op-/ondergaat.
 */
function solarEventUtc(y: number, mo: number, d: number, lat: number, lon: number, rise: boolean): number | null {
  const rad = Math.PI / 180;
  const start = Date.UTC(y, 0, 0);
  const N = Math.floor((Date.UTC(y, mo, d) - start) / 86_400_000);
  const lngHour = lon / 15;
  const t = rise ? N + (6 - lngHour) / 24 : N + (18 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const zenith = 90.833;
  const cosH = (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;
  let H = rise ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad;
  H /= 15;
  const T = H + RA - 0.06571 * t - 6.622;
  const UT = ((T - lngHour) % 24 + 24) % 24;
  const hours = Math.floor(UT);
  const minutes = Math.round((UT - hours) * 60);
  return Date.UTC(y, mo, d, hours, minutes);
}

interface MetEntry {
  time: string;
  data: {
    instant?: { details?: { air_temperature?: number; wind_speed?: number; wind_from_direction?: number } };
    next_1_hours?: { summary?: { symbol_code?: string }; details?: { probability_of_precipitation?: number } };
  };
}

export async function fetchWeatherMetNo(location: WeatherLocation): Promise<WeatherNow | null> {
  const loc = WEATHER_LOCATIONS[location];
  const tz = ("timezone" in loc && loc.timezone) || "Europe/Brussels";
  const url = `${BASE}?lat=${loc.latitude}&lon=${loc.longitude}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { properties?: { timeseries?: MetEntry[] } };
    const series = json.properties?.timeseries ?? [];
    const first = series[0];
    const inst = first?.data.instant?.details;
    if (!first || inst?.air_temperature == null) return null;

    const windKmh = (inst.wind_speed ?? 0) * 3.6;
    const rainPct = Math.round(first.data.next_1_hours?.details?.probability_of_precipitation ?? 0);

    // Dagmaximum uit de resterende uren van vandaag (lokale datum).
    const todayLocal = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    let tMax = inst.air_temperature;
    for (const e of series) {
      const dLocal = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(e.time));
      if (dLocal !== todayLocal) continue;
      const temp = e.data.instant?.details?.air_temperature;
      if (temp != null && temp > tMax) tMax = temp;
    }

    // Zonsop-/ondergang voor vandaag (lokale datum).
    const [yy, mm, dd] = todayLocal.split("-").map(Number);
    const riseMs = solarEventUtc(yy, mm - 1, dd, loc.latitude, loc.longitude, true);
    const setMs = solarEventUtc(yy, mm - 1, dd, loc.latitude, loc.longitude, false);

    return {
      location: loc.label,
      tempC: Math.round(inst.air_temperature),
      condition: symbolNl(first.data.next_1_hours?.summary?.symbol_code),
      rainChancePct: rainPct,
      windText: `${windDirNl(inst.wind_from_direction ?? 0)} ${beaufort(windKmh)} Bft · ${Math.round(windKmh)} km/u`,
      sunrise: riseMs != null ? hhmmInTz(riseMs, tz) : undefined,
      sunset: setMs != null ? hhmmInTz(setMs, tz) : undefined,
      forecastText: `Max ${Math.round(tMax)}°C · ${rainPct <= 20 ? "Droog" : "Kans op regen"}`,
    };
  } catch {
    return null;
  }
}
