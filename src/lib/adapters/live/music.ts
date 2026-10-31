/**
 * Live muziek-adapter — stuurt de Sonos RECHTSTREEKS aan (lokaal UPnP, D-014),
 * omdat de Spotify Web API Sonos-toestellen niet mag besturen (restricted → 403).
 * De Sonos speelt onze Spotify-content af; wij regelen play/pauze/volume lokaal.
 * Server-side roept hij de Sonos-client aan; client-side via onze eigen
 * /api/music-route (geen CORS). Bij falen: discrete niet-beschikbaar-status.
 */
import type { MusicAdapter, MusicState, Sourced } from "../types";
import { getState, pause, play, setVolume } from "@/lib/music/sonos";

export const liveMusicAdapter: MusicAdapter = {
  async getState(): Promise<Sourced<MusicState>> {
    if (typeof window === "undefined") {
      return getState();
    }
    try {
      const res = await fetch("/api/music");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Sourced<MusicState>;
    } catch {
      return { source: "live", fetchedAt: Date.now(), data: null };
    }
  },
  async play(): Promise<void> {
    if (typeof window === "undefined") {
      await play();
      return;
    }
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "play" }),
    });
  },
  async stop(): Promise<void> {
    if (typeof window === "undefined") {
      await pause();
      return;
    }
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stop" }),
    });
  },
  async setVolume(pct: number): Promise<void> {
    if (typeof window === "undefined") {
      await setVolume(pct);
      return;
    }
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setVolume", pct }),
    });
  },
};
