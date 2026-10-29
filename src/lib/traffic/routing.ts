/**
 * Live reistijd Oostduinkerke → Gistel. Twee bronnen, zonder UI-wijziging:
 *   - TomTom (als `TOMTOM_API_KEY` gezet is): mét live verkeer → files/vertraging.
 *   - OSRM (sleutelvrij, standaard): echte afstand + basisreistijd, zónder live verkeer.
 * Draait server-side; client via /api/traffic. Bij falen een discrete status
 * (data: null), nooit verzonnen data (§9). 5 min gecachet.
 */

import type { Sourced, TrafficInfo } from "@/lib/adapters/types";
import { TRAFFIC_ROUTE } from "./config";

const FROM_TO = `${TRAFFIC_ROUTE.from.label} → ${TRAFFIC_ROUTE.to.label}`;

/** TomTom Routing met live verkeer. Alleen gebruikt als er een sleutel is. */
async function fetchTomTom(key: string): Promise<Sourced<TrafficInfo>> {
  const { from, to } = TRAFFIC_ROUTE;
  const url =
    `https://api.tomtom.com/routing/1/calculateRoute/${from.lat},${from.lon}:${to.lat},${to.lon}/json` +
    `?key=${encodeURIComponent(key)}&traffic=true&travelMode=car`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`TomTom HTTP ${res.status}`);
  const json = (await res.json()) as {
    routes?: { summary?: { travelTimeInSeconds?: number; noTrafficTravelTimeInSeconds?: number; trafficDelayInSeconds?: number; lengthInMeters?: number } }[];
  };
  const s = json.routes?.[0]?.summary;
  if (!s || s.travelTimeInSeconds == null) throw new Error("TomTom: onvolledig");

  const durationMin = Math.round(s.travelTimeInSeconds / 60);
  const delaySec = s.trafficDelayInSeconds ?? 0;
  const base = s.noTrafficTravelTimeInSeconds ?? s.travelTimeInSeconds;
  const ratio = base > 0 ? delaySec / base : 0;
  const flow: TrafficInfo["flow"] = ratio < 0.1 ? "vlot" : ratio < 0.3 ? "druk" : "stilstaand";

  return {
    source: "live",
    fetchedAt: Date.now(),
    data: {
      fromTo: FROM_TO,
      via: "Snelste route (TomTom)",
      durationMin,
      distanceKm: Math.round((s.lengthInMeters ?? 0) / 100) / 10,
      flow,
      incidents: [],
      trafficAware: true,
      delayMin: Math.round(delaySec / 60),
    },
  };
}

/** OSRM, sleutelvrij: echte afstand + basisreistijd zonder live verkeer. */
async function fetchOsrm(): Promise<Sourced<TrafficInfo>> {
  const { from, to } = TRAFFIC_ROUTE;
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lon},${from.lat};${to.lon},${to.lat}?overview=false&alternatives=false&steps=false`;
  const res = await fetch(url, {
    headers: { "User-Agent": "aura-ochtendroutine/1.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const json = (await res.json()) as { code?: string; routes?: { duration: number; distance: number }[] };
  const r = json.routes?.[0];
  if (json.code !== "Ok" || !r) throw new Error("OSRM: geen route");

  return {
    source: "live",
    fetchedAt: Date.now(),
    data: {
      fromTo: FROM_TO,
      via: "Snelste route",
      durationMin: Math.round(r.duration / 60),
      distanceKm: Math.round(r.distance / 100) / 10,
      flow: "onbekend",
      incidents: [],
      trafficAware: false,
    },
  };
}

export async function fetchTraffic(): Promise<Sourced<TrafficInfo>> {
  const key = process.env.TOMTOM_API_KEY;
  try {
    if (key) {
      try {
        return await fetchTomTom(key);
      } catch {
        // TomTom faalde → val terug op de sleutelvrije basisreistijd.
      }
    }
    return await fetchOsrm();
  } catch {
    return { source: "live", fetchedAt: Date.now(), data: null };
  }
}
