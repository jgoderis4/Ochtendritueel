/**
 * Microsoft Graph-client (server-side) voor de agenda-adapter.
 *
 * PRIVACY (D-005): leest de agenda van vandaag en geeft UITSLUITEND een afgeleide
 * bestemming terug (de locatie van de eerstvolgende afspraak met een plaats).
 * Titel, deelnemers en overige details worden bewust NOOIT gelezen uit het
 * antwoord doorgegeven of gelogd.
 *
 * Draait alleen server-side (secret blijft server-side).
 */

import type { CommuteOverride, Sourced } from "@/lib/adapters/types";
import {
  CALENDAR_TIMEZONE,
  MS_GRAPH_BASE,
  MS_REDIRECT_URI,
  MS_SCOPES,
  MS_TOKEN_URL,
  calendarConfig,
  calendarConfigured,
} from "./config";

/* --- Access token (gecachet tot vlak voor expiry) --- */
let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (!calendarConfigured()) throw new Error("Outlook niet geconfigureerd");
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const body = new URLSearchParams({
    client_id: calendarConfig.clientId,
    client_secret: calendarConfig.clientSecret,
    grant_type: "refresh_token",
    refresh_token: calendarConfig.refreshToken,
    redirect_uri: MS_REDIRECT_URI,
    scope: MS_SCOPES,
  });
  const res = await fetch(MS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`MS token HTTP ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

/* --- Dag-afbakening (lokale tijdzone) --- */
function todayWindow(): { start: string; end: string } {
  const now = new Date();
  // Begin en einde van vandaag in lokale tijd; Graph krijgt ISO + tijdzone-header.
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Graph-afspraak (alleen de velden die we lezen). Bewust GÉÉN `subject`,
 * `attendees` of `body` — die willen we niet eens binnenhalen (D-005).
 */
interface GraphEvent {
  start?: { dateTime?: string };
  isAllDay?: boolean;
  location?: { displayName?: string };
}

/**
 * Leidt de bestemming voor vandaag af: de locatie van de eerstvolgende afspraak
 * (op tijd gesorteerd) die een echte plaats heeft. null = geen → standaardroute.
 */
export async function getCommuteOverride(): Promise<Sourced<CommuteOverride>> {
  if (!calendarConfigured()) {
    return { source: "live", fetchedAt: Date.now(), data: null };
  }
  try {
    const token = await getAccessToken();
    const { start, end } = todayWindow();
    // $select beperkt bewust tot niet-gevoelige velden; geen subject/attendees.
    const url =
      `${MS_GRAPH_BASE}/me/calendarView` +
      `?startDateTime=${encodeURIComponent(start)}&endDateTime=${encodeURIComponent(end)}` +
      `&$select=start,isAllDay,location&$orderby=start/dateTime&$top=25`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: `outlook.timezone="${CALENDAR_TIMEZONE}"`,
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Graph calendarView HTTP ${res.status}`);
    const json = (await res.json()) as { value?: GraphEvent[] };
    const events = json.value ?? [];

    // Eerste afspraak met een echte locatie (niet-hele-dag) wordt de bestemming.
    const withLocation = events.find(
      (e) => !e.isAllDay && (e.location?.displayName ?? "").trim().length > 0,
    );
    const destination = withLocation?.location?.displayName?.trim() ?? null;

    return {
      source: "live",
      fetchedAt: Date.now(),
      data: { destination },
    };
  } catch {
    return { source: "live", fetchedAt: Date.now(), data: null };
  }
}
