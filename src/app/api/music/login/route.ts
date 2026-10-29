/**
 * Eenmalige Spotify-login. Stuurt je naar Spotify om toestemming te geven.
 * Na toestemming komt je terug op /api/music/callback, die de refresh token toont.
 * Alleen nodig om de refresh token te verkrijgen; daarna niet meer gebruiken.
 */
import { NextResponse } from "next/server";
import {
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPES,
  spotifyConfig,
} from "@/lib/music/config";

export async function GET() {
  if (!spotifyConfig.clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID ontbreekt in .env.local" },
      { status: 500 },
    );
  }
  const params = new URLSearchParams({
    client_id: spotifyConfig.clientId,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    show_dialog: "true",
  });
  return NextResponse.redirect(`${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`);
}
