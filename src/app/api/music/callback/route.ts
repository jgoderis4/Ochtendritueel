/**
 * Callback van de eenmalige Spotify-login. Ruilt de `code` om voor tokens en toont
 * de REFRESH TOKEN één keer, zodat je die in .env.local kunt plakken als
 * SPOTIFY_REFRESH_TOKEN. Daarna is deze route niet meer nodig.
 *
 * De refresh token wordt bewust alleen hier (lokaal, in je eigen browser) getoond
 * en nergens opgeslagen of gelogd.
 */
import { NextResponse } from "next/server";
import {
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_TOKEN_URL,
  spotifyConfig,
} from "@/lib/music/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "Geen code ontvangen" }, { status: 400 });
  }
  if (!spotifyConfig.clientId || !spotifyConfig.clientSecret) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET ontbreekt in .env.local" },
      { status: 500 },
    );
  }

  const basic = Buffer.from(
    `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`,
  ).toString("base64");
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Token-uitwisseling mislukt (HTTP ${res.status})`, detail: text },
      { status: 500 },
    );
  }

  const json = (await res.json()) as { refresh_token?: string };
  if (!json.refresh_token) {
    return NextResponse.json(
      { error: "Geen refresh_token in antwoord" },
      { status: 500 },
    );
  }

  // Eenvoudige HTML-pagina: toon de token één keer met kopieerbare instructie.
  const html = `<!doctype html>
<html lang="nl">
<head><meta charset="utf-8"><title>Spotify gekoppeld</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 20px;line-height:1.5;color:#1a1a1a}
  code{background:#f2f2f2;padding:2px 6px;border-radius:4px}
  .token{display:block;background:#111;color:#0f0;padding:16px;border-radius:8px;word-break:break-all;margin:16px 0;font-family:monospace}
  .warn{color:#b00}
</style></head>
<body>
  <h1>✅ Spotify gekoppeld</h1>
  <p>Kopieer onderstaande <strong>refresh token</strong> en plak hem in <code>.env.local</code> als:</p>
  <p><code>SPOTIFY_REFRESH_TOKEN=...</code></p>
  <div class="token">${json.refresh_token}</div>
  <p class="warn">Deze token wordt maar één keer getoond en is een geheim — deel hem met niemand.</p>
  <p>Daarna de dev-server herstarten. Deze pagina mag je sluiten.</p>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
