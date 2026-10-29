/**
 * Spotify Web API-client (server-side). Wisselt de refresh token om voor korte
 * access tokens en bestuurt playback op een Spotify Connect-toestel (de Sonos).
 *
 * Belangrijk: Spotify speelt zelf geen geluid af — het stuurt een bestaand
 * Connect-toestel aan. Zonder actief toestel geeft Spotify "no active device".
 * Draait alleen server-side (secret blijft server-side).
 */

import type { MusicState, Sourced } from "@/lib/adapters/types";
import {
  SPOTIFY_API_BASE,
  SPOTIFY_TOKEN_URL,
  spotifyConfig,
  spotifyConfigured,
} from "./config";

/* --- Access token (gecachet tot vlak voor expiry) --- */
let cachedToken: { value: string; expiresAt: number } | null = null;

function basicAuthHeader(): string {
  const raw = `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

export async function getAccessToken(): Promise<string> {
  if (!spotifyConfigured()) throw new Error("Spotify niet geconfigureerd");
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: spotifyConfig.refreshToken,
  });
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token HTTP ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    // 60s marge zodat we nooit met een net-verlopen token werken.
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

async function api(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<Response> {
  const token = init?.token ?? (await getAccessToken());
  return fetch(`${SPOTIFY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

/* --- Toestellen --- */
export interface SpotifyDevice {
  id: string | null;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number | null;
}

export async function listDevices(): Promise<SpotifyDevice[]> {
  const res = await api("/me/player/devices");
  if (!res.ok) throw new Error(`Spotify devices HTTP ${res.status}`);
  const json = (await res.json()) as { devices?: SpotifyDevice[] };
  return json.devices ?? [];
}

/**
 * Kiest het doel-toestel: bij een ingestelde naam dat toestel, anders het actieve,
 * anders het eerste beschikbare. null = geen toestel gevonden.
 */
async function resolveTargetDevice(): Promise<SpotifyDevice | null> {
  const devices = await listDevices();
  if (devices.length === 0) return null;
  const wanted = spotifyConfig.deviceName.trim().toLowerCase();
  if (wanted) {
    const match = devices.find((d) => d.name.toLowerCase() === wanted);
    if (match) return match;
  }
  return devices.find((d) => d.is_active) ?? devices[0];
}

/* --- State --- */
interface PlaybackResponse {
  is_playing: boolean;
  device?: { name?: string; volume_percent?: number };
  context?: { type?: string; uri?: string };
  item?: { name?: string; album?: { name?: string } };
}

async function playlistName(uri: string): Promise<string | null> {
  // uri: spotify:playlist:<id>
  const id = uri.split(":").pop();
  if (!id) return null;
  const res = await api(`/playlists/${id}?fields=name`);
  if (!res.ok) return null;
  const json = (await res.json()) as { name?: string };
  return json.name ?? null;
}

export async function getState(): Promise<Sourced<MusicState>> {
  if (!spotifyConfigured()) {
    return { source: "live", fetchedAt: Date.now(), data: null };
  }
  try {
    const res = await api("/me/player");
    // 204 = niets speelt / geen actief toestel.
    if (res.status === 204) {
      const device = await resolveTargetDevice();
      return {
        source: "live",
        fetchedAt: Date.now(),
        data: {
          speaker: device ? device.name : "Geen actief toestel",
          playlist: "—",
          volumePct: device?.volume_percent ?? 0,
          playing: false,
        },
      };
    }
    if (!res.ok) throw new Error(`Spotify player HTTP ${res.status}`);
    const p = (await res.json()) as PlaybackResponse;

    let playlist = p.item?.name ?? "—";
    if (p.context?.type === "playlist" && p.context.uri) {
      const name = await playlistName(p.context.uri);
      if (name) playlist = name;
    }

    return {
      source: "live",
      fetchedAt: Date.now(),
      data: {
        speaker: p.device?.name ?? "Onbekend toestel",
        playlist,
        volumePct: p.device?.volume_percent ?? 0,
        playing: Boolean(p.is_playing),
      },
    };
  } catch {
    return { source: "live", fetchedAt: Date.now(), data: null };
  }
}

/* --- Besturing --- */

/**
 * Start muziek op het doel-toestel. Zonder lopende context start de standaard
 * ochtend-playlist; met lopende context hervat het alleen. Transfer eerst zodat
 * de Sonos het actieve toestel wordt.
 */
export async function play(): Promise<void> {
  const device = await resolveTargetDevice();
  const deviceQuery = device?.id ? `?device_id=${encodeURIComponent(device.id)}` : "";

  const body: Record<string, unknown> = {};
  if (spotifyConfig.defaultPlaylistUri) {
    body.context_uri = spotifyConfig.defaultPlaylistUri;
  }
  const res = await api(`/me/player/play${deviceQuery}`, {
    method: "PUT",
    body: Object.keys(body).length ? JSON.stringify(body) : undefined,
  });
  // 202/204 = ok. Andere statussen negeren we stil (adapter mag niet crashen).
  if (!res.ok && res.status !== 202 && res.status !== 204) {
    throw new Error(`Spotify play HTTP ${res.status}`);
  }
}

export async function pause(): Promise<void> {
  const device = await resolveTargetDevice();
  const deviceQuery = device?.id ? `?device_id=${encodeURIComponent(device.id)}` : "";
  const res = await api(`/me/player/pause${deviceQuery}`, { method: "PUT" });
  if (!res.ok && res.status !== 202 && res.status !== 204) {
    throw new Error(`Spotify pause HTTP ${res.status}`);
  }
}

export async function setVolume(pct: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const device = await resolveTargetDevice();
  const deviceQuery = device?.id ? `&device_id=${encodeURIComponent(device.id)}` : "";
  const res = await api(`/me/player/volume?volume_percent=${clamped}${deviceQuery}`, {
    method: "PUT",
  });
  if (!res.ok && res.status !== 202 && res.status !== 204) {
    throw new Error(`Spotify volume HTTP ${res.status}`);
  }
}
