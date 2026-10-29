/**
 * Route handler voor muziek. GET levert de huidige playback-state; POST bestuurt
 * de speler (play/stop/setVolume) op het Spotify Connect-toestel (de Sonos).
 * Server-side zodat de client geen Spotify-secret of CORS nodig heeft.
 */
import { getState, pause, play, setVolume } from "@/lib/music/spotify";

export async function GET() {
  const result = await getState();
  return Response.json(result);
}

export async function POST(request: Request) {
  let body: { action?: string; pct?: number };
  try {
    body = (await request.json()) as { action?: string; pct?: number };
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
      default:
        return Response.json({ error: "Onbekende actie" }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekende fout";
    return Response.json({ ok: false, error: msg }, { status: 502 });
  }
}
