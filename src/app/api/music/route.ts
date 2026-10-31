/**
 * Route handler voor muziek. Stuurt de Sonos rechtstreeks aan (lokaal UPnP, D-014).
 *  - GET                 → huidige playback-state
 *  - GET ?favorites=1    → lijst van kiesbare Sonos-favorieten
 *  - POST {action}       → play / stop / setVolume / playFavorite
 * Server-side zodat de client geen CORS of netwerktoegang tot de speaker nodig heeft.
 */
import {
  getState,
  listFavorites,
  pause,
  play,
  playFavorite,
  setMusicPrefs,
  setVolume,
} from "@/lib/music/sonos";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("favorites")) {
    const favorites = await listFavorites();
    return Response.json({ favorites });
  }
  const result = await getState();
  return Response.json(result);
}

export async function POST(request: Request) {
  let body: { action?: string; pct?: number; name?: string; style?: string; volume?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Ongeldige body" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "play":
        await play();
        break;
      case "stop":
        await pause();
        break;
      case "setVolume":
        if (typeof body.pct !== "number") {
          return Response.json({ error: "pct ontbreekt" }, { status: 400 });
        }
        await setVolume(body.pct);
        break;
      case "playFavorite": {
        if (!body.name) {
          return Response.json({ error: "naam ontbreekt" }, { status: 400 });
        }
        const ok = await playFavorite(body.name);
        if (!ok) {
          return Response.json({ ok: false, error: "Favoriet niet gevonden" }, { status: 404 });
        }
        break;
      }
      case "setPrefs":
        // Muziekstijl (genre) + achtergrondvolume uit de instellingen synchroniseren.
        setMusicPrefs({ style: body.style, volume: body.volume });
        break;
      default:
        return Response.json({ error: "Onbekende actie" }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekende fout";
    return Response.json({ ok: false, error: msg }, { status: 502 });
  }
}
