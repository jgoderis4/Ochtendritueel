/**
 * Eenmalige Outlook-login. Stuurt je naar Microsoft om toestemming te geven voor
 * het LEZEN van je agenda (Calendars.Read). Na toestemming kom je terug op
 * /api/calendar/callback, die de refresh token toont. Alleen nodig om die token
 * te verkrijgen; daarna niet meer gebruiken.
 */
import { NextResponse } from "next/server";
import {
  MS_AUTHORIZE_URL,
  MS_REDIRECT_URI,
  MS_SCOPES,
  calendarConfig,
} from "@/lib/calendar/config";

export async function GET() {
  if (!calendarConfig.clientId) {
    return NextResponse.json(
      { error: "MS_CLIENT_ID ontbreekt in .env.local" },
      { status: 500 },
    );
  }
  const params = new URLSearchParams({
    client_id: calendarConfig.clientId,
    response_type: "code",
    redirect_uri: MS_REDIRECT_URI,
    response_mode: "query",
    scope: MS_SCOPES,
    prompt: "consent",
  });
  return NextResponse.redirect(`${MS_AUTHORIZE_URL}?${params.toString()}`);
}
