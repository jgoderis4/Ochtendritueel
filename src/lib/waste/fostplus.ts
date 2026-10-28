/**
 * Live afvalkalender via de officiële Recycle!/Fost Plus API (Stap 5, eerste
 * echte bron). Auth-vrij publiek endpoint; draait server-side (geen CORS).
 *
 * Bij elk falen geven we een discrete "niet beschikbaar"-status (data: null)
 * i.p.v. verzonnen waarden (D-004 / PRD §9). Resultaat wordt 1 uur gecachet.
 */

import type { Sourced, WasteInfo } from "@/lib/adapters/types";
import { WASTE_CONFIG } from "./config";

const BASE = "https://api.fostplus.be/recyclecms/public/v1";
const HEADERS = {
  "x-consumer": "recycleapp.be",
  "User-Agent": "aura-ochtendroutine/1.0",
};

/** Datum in de zone Brussel als YYYY-MM-DD (en-CA levert exact dat formaat). */
function brusselsYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Leesbaar NL-label voor een ophaaldatum (Vandaag/Morgen/"Zaterdag 25 mei"). */
function nlDateLabel(ymd: string, todayYmd: string, tomorrowYmd: string): string {
  if (ymd === todayYmd) return "Vandaag";
  if (ymd === tomorrowYmd) return "Morgen";
  const d = new Date(`${ymd}T12:00:00`);
  const s = d.toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Brussels",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface CollectionItem {
  type?: string;
  timestamp?: string;
  exception?: { replacedBy?: unknown };
  fraction?: { name?: { nl?: string; en?: string } };
}

export async function fetchWasteCollection(): Promise<Sourced<WasteInfo>> {
  const { zipcodeId, streetId, houseNumber, street, city } = WASTE_CONFIG;
  const now = new Date();
  const todayYmd = brusselsYmd(now);
  const tomorrowYmd = brusselsYmd(new Date(now.getTime() + 86_400_000));
  const untilYmd = brusselsYmd(new Date(now.getTime() + 35 * 86_400_000));
  const address = `${street} ${houseNumber}, ${city}`;

  const url = new URL(`${BASE}/collections`);
  url.searchParams.set("zipcodeId", zipcodeId);
  url.searchParams.set("streetId", streetId);
  url.searchParams.set("houseNumber", String(houseNumber));
  url.searchParams.set("fromDate", todayYmd);
  url.searchParams.set("untilDate", untilYmd);

  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { items?: CollectionItem[] };
    const items = json.items ?? [];

    // Fracties groeperen per datum.
    const byDate = new Map<string, string[]>();
    for (const it of items) {
      if (it.type !== "collection") continue;
      if (it.exception?.replacedBy) continue; // vervangen door een andere datum
      const ts = it.timestamp;
      const name = it.fraction?.name?.nl ?? it.fraction?.name?.en;
      if (!ts || !name) continue;
      const ymd = ts.slice(0, 10);
      const arr = byDate.get(ymd) ?? [];
      if (!arr.includes(name)) arr.push(name);
      byDate.set(ymd, arr);
    }

    const todayFractions = byDate.get(todayYmd) ?? [];
    const futureDates = [...byDate.keys()].filter((d) => d > todayYmd).sort();
    const next = futureDates.length
      ? {
          date: nlDateLabel(futureDates[0], todayYmd, tomorrowYmd),
          fractions: byDate.get(futureDates[0])!,
        }
      : undefined;

    return {
      source: "live",
      fetchedAt: now.getTime(),
      data: { address, todayFractions, next },
    };
  } catch {
    // Discrete status: geen verzonnen data (D-004 / §9).
    return { source: "live", fetchedAt: now.getTime(), data: null };
  }
}
