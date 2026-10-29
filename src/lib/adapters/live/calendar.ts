/**
 * Live agenda-adapter (Outlook/Microsoft Graph). Server-side roept hij Graph
 * rechtstreeks aan; client-side via onze eigen /api/calendar-route (geen CORS).
 * Geeft UITSLUITEND een afgeleide bestemming terug (D-005). Bij falen: discrete
 * "niet beschikbaar"-status (data: null).
 */
import type { CalendarAdapter, CommuteOverride, Sourced } from "../types";
import { getCommuteOverride } from "@/lib/calendar/graph";

export const liveCalendarAdapter: CalendarAdapter = {
  async getCommuteOverride(): Promise<Sourced<CommuteOverride>> {
    if (typeof window === "undefined") {
      return getCommuteOverride();
    }
    try {
      const res = await fetch("/api/calendar");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Sourced<CommuteOverride>;
    } catch {
      return { source: "live", fetchedAt: Date.now(), data: null };
    }
  },
};
