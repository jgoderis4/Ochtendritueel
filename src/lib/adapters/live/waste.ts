/**
 * Live afval-adapter (eerste echte bron). Server-side roept hij de Fost Plus-
 * fetch rechtstreeks aan; client-side gaat hij via onze eigen /api/waste-route
 * (geen CORS). Bij falen: discrete "niet beschikbaar"-status (data: null).
 */
import type { Sourced, WasteAdapter, WasteInfo } from "../types";
import { fetchWasteCollection } from "@/lib/waste/fostplus";

export const liveWasteAdapter: WasteAdapter = {
  async getCollection(): Promise<Sourced<WasteInfo>> {
    if (typeof window === "undefined") {
      return fetchWasteCollection();
    }
    try {
      const res = await fetch("/api/waste");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Sourced<WasteInfo>;
    } catch {
      return { source: "live", fetchedAt: Date.now(), data: null };
    }
  },
};
