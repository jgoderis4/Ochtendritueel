"use client";

/**
 * Muziekbediening (Spotify → Sonos via Connect). Toont de live speler-status en
 * stuurt play/pauze/volume naar het actieve Connect-toestel. Spotify maakt zelf
 * geen geluid: er moet een actief toestel zijn (de Spotify-app op de Mac, of
 * straks de Sonos). Zonder toestel meldt de pagina dat eerlijk.
 */

import { useCallback, useEffect, useState } from "react";
import { getAdapters, type MusicState, type Sourced } from "@/lib/adapters";

const a = getAdapters();

export default function MusicPage() {
  const [state, setState] = useState<Sourced<MusicState> | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await a.music.getState();
      setState(r);
      setError(null);
    } catch {
      setError("Status ophalen mislukt.");
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/music?favorites=1");
      const json = (await res.json()) as { favorites?: string[] };
      setFavorites(json.favorites ?? []);
    } catch {
      /* lijst niet beschikbaar; stil negeren */
    }
  }, []);

  useEffect(() => {
    // Eenmalig de live status + favorietenlijst laden bij mount (bewust patroon).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    void loadFavorites();
  }, [refresh, loadFavorites]);

  async function playFavorite(name: string) {
    await run(async () => {
      const res = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "playFavorite", name }),
      });
      if (!res.ok) throw new Error("kon favoriet niet starten");
    });
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      // Kort wachten zodat Spotify de nieuwe status heeft verwerkt.
      await new Promise((r) => setTimeout(r, 600));
      await refresh();
    } catch {
      setError("Actie mislukt — staat er een actief Spotify-toestel aan?");
    } finally {
      setBusy(false);
    }
  }

  const data = state?.data ?? null;
  const live = state?.source === "live";

  return (
    <main className="flex flex-col gap-6">
      <header>
        <p className="text-label-lg font-semibold uppercase tracking-[0.06em] text-emerald">
          Aura · muziek
        </p>
        <h1 className="font-display text-headline-xl font-semibold text-text-high">
          Spotify-bediening
        </h1>
      </header>

      {/* Live statuskaart */}
      <section className="rounded-lg border border-border bg-surface/90 p-6">
        <div className="flex items-center justify-between">
          <span className="text-label-md uppercase tracking-[0.04em] text-text-mid">
            Toestel
          </span>
          <span
            className={`inline-flex items-center gap-2 text-label-md font-medium ${
              live ? "text-emerald" : "text-amber"
            }`}
          >
            <span className={`size-2 rounded-full ${live ? "bg-emerald" : "bg-amber"}`} />
            {live ? "Live" : "Voorbeelddata"}
          </span>
        </div>

        {data ? (
          <>
            <p className="mt-2 font-display text-headline-lg font-semibold text-text-high">
              {data.speaker}
            </p>
            <p className="mt-1 text-body-lg text-text-mid">{data.playlist}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-label-md text-text-mid">
                {data.playing ? "▶ Speelt af" : "⏸ Gepauzeerd"}
              </span>
              <span className="tabular text-label-md text-text-mid">
                volume {data.volumePct}%
              </span>
            </div>
          </>
        ) : (
          <p className="mt-2 text-body-md text-text-mid">
            Geen actief toestel gevonden. Open de Spotify-app op je Mac (of zet de
            Sonos aan) en vernieuw.
          </p>
        )}
      </section>

      {/* Knoppen */}
      <section className="flex flex-col gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => a.music.play())}
          className="rounded-md bg-amber px-5 py-4 text-left text-body-lg font-semibold text-canvas transition-opacity active:opacity-70 disabled:opacity-50"
        >
          ▶ Afspelen (ochtend-playlist)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => a.music.stop())}
          className="rounded-md border border-border bg-surface-2 px-5 py-4 text-left text-body-lg font-semibold text-text-high transition-opacity active:opacity-70 disabled:opacity-50"
        >
          ⏸ Pauzeren
        </button>

        <div className="rounded-md border border-border bg-surface-2 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-body-lg font-semibold text-text-high">Volume</span>
            <span className="tabular text-label-md text-text-mid">
              {data?.volumePct ?? 0}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            defaultValue={data?.volumePct ?? 30}
            disabled={busy}
            onChange={(e) => run(() => a.music.setVolume(Number(e.target.value)))}
            className="mt-3 w-full accent-amber"
          />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void refresh()}
          className="rounded-md border border-border bg-transparent px-5 py-3 text-left text-body-md font-medium text-text-mid transition-opacity active:opacity-70 disabled:opacity-50"
        >
          ↻ Status vernieuwen
        </button>
      </section>

      {/* Muziekkeuze: Sonos-favorieten */}
      <section className="flex flex-col gap-3">
        <h2 className="text-label-lg font-semibold uppercase tracking-[0.04em] text-text-mid">
          Kies muziek
        </h2>
        {favorites.length === 0 ? (
          <p className="text-body-md text-text-mid">
            Geen favorieten gevonden. Voeg playlists of radio toe als favoriet in de
            Sonos-app; ze verschijnen hier automatisch.
          </p>
        ) : (
          favorites.map((name) => (
            <button
              key={name}
              type="button"
              disabled={busy}
              onClick={() => void playFavorite(name)}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface/90 px-5 py-4 text-left transition-opacity active:opacity-70 disabled:opacity-50"
            >
              <span className="text-body-lg font-medium text-text-high">{name}</span>
              <span className="text-label-md text-emerald">▶ Speel af</span>
            </button>
          ))
        )}
      </section>

      {error && <p className="text-label-md text-danger">{error}</p>}

      <p className="text-label-md text-text-muted">
        Spotify stuurt een bestaand Connect-toestel aan en maakt zelf geen geluid.
        Nu speelt dit op het actieve toestel (bv. de Spotify-app op je Mac). Zodra de
        Sonos als Connect-toestel aanstaat, zetten we zijn naam in
        <code> SPOTIFY_DEVICE_NAME</code> en gaat het geluid daarheen.
      </p>
    </main>
  );
}
