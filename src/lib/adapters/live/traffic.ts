/**
 * Live verkeer-adapter. Server-side roept hij de routering rechtstreeks aan;
 * client-side via onze eigen /api/traffic-route (geen CORS). Bij falen: discrete
 * "niet beschikbaar"-status (data: null).
 */
import type { Sourced, TrafficAdapter, TrafficInfo } from "../types";
import { fetchTraffic } from "@/lib/traffic/routing";

export const liveTrafficAdapter: TrafficAdapter = {
  async getTraffic(): Promise<Sourced<TrafficInfo>> {
    if (typeof window === "undefined") {
      return fetchTraffic();
    }
    try {
      const res = await fetch("/api/traffic");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Sourced<TrafficInfo>;
    } catch {
      return { source: "live", fetchedAt: Date.now(), data: null };
    }
  },
};
