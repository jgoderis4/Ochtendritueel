/**
 * Koppeling met het losse "porsche-tracker"-project (draait op de Mac, 2x/dag).
 * Dat project schrijft een dashboard.html met daarin een JSON-dataobject
 * ({"bijgewerkt":..., "autos":[...]}). Wij lezen dat bestand server-side en halen
 * de top-3 wagens (hoogste score) eruit voor de Aura-tegel.
 *
 * Alleen beschikbaar waar het bestand staat (de Mac). Op de Pi later: niet aanwezig
 * → tegel toont discreet "niet beschikbaar" (geen fout).
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const DASHBOARD_PATH =
  process.env.PORSCHE_DASHBOARD_PATH ??
  path.join(os.homedir(), "Library/Application Support/porsche-tracker/dashboard.html");

export interface PorscheCar {
  titel: string;
  model: string;
  generatie: string;
  jaar: number | null;
  km: number | null;
  prijs: number | null; // all-in indien beschikbaar, anders vraagprijs
  dealPct: number | null; // korting t.o.v. marktprijs
  score: number;
  plaats: string;
  land: string;
  url: string;
}

export interface PorscheTop {
  available: boolean;
  updated: string | null;
  cars: PorscheCar[];
}

interface RawCar {
  titel?: string;
  model?: string;
  generatie?: string;
  jaar?: number;
  km?: number;
  prijs?: number;
  all_in?: number;
  deal_pct?: number;
  score?: number;
  plaats?: string;
  land?: string;
  url?: string;
}

/** Haalt het ingespoten JSON-object uit de dashboard-HTML (string-bewust, gebalanceerd). */
function extractData(html: string): { bijgewerkt?: string; autos?: RawCar[] } | null {
  const start = html.indexOf('{"bijgewerkt"');
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export async function getPorscheTop(n = 3): Promise<PorscheTop> {
  try {
    const html = await fs.readFile(DASHBOARD_PATH, "utf-8");
    const data = extractData(html);
    const autos = data?.autos ?? [];
    if (autos.length === 0) return { available: false, updated: null, cars: [] };

    const cars: PorscheCar[] = [...autos]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, n)
      .map((a) => ({
        titel: a.titel ?? "",
        model: a.model ?? "",
        generatie: a.generatie ?? "",
        jaar: a.jaar ?? null,
        km: a.km ?? null,
        prijs: a.all_in ?? a.prijs ?? null,
        dealPct: typeof a.deal_pct === "number" ? a.deal_pct : null,
        score: a.score ?? 0,
        plaats: a.plaats ?? "",
        land: a.land ?? "",
        url: a.url ?? "",
      }));

    return { available: true, updated: data?.bijgewerkt ?? null, cars };
  } catch {
    // Bestand niet gevonden (bv. op de Pi) → discreet niet beschikbaar.
    return { available: false, updated: null, cars: [] };
  }
}
