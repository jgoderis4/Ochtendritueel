"use client";

import { useState } from "react";
import { getAdapters } from "@/lib/adapters";

type Status = "idle" | "running" | "ok" | "mock" | "missing";

interface TestDef {
  key: string;
  label: string;
  run: () => Promise<{ status: Status; detail: string }>;
}

const a = getAdapters();

/** Vertaalt een adapter-resultaat naar een teststatus (eerlijk over mock/ontbrekend). */
function classify(source: "mock" | "live", hasData: boolean, detail: string) {
  if (!hasData) return { status: "missing" as Status, detail: "Geen gegevens" };
  return { status: source === "live" ? ("ok" as Status) : ("mock" as Status), detail };
}

const TESTS: TestDef[] = [
  {
    key: "tv",
    label: "TV / dashboard",
    run: async () => ({ status: "mock", detail: "Dashboard rendert (lokaal, voorbeelddata)" }),
  },
  {
    key: "music",
    label: "Sonos / Spotify",
    run: async () => {
      const r = await a.music.getState();
      return classify(r.source, !!r.data, r.data ? `${r.data.speaker} · ${r.data.playlist}` : "");
    },
  },
  {
    key: "weather-odk",
    label: "Weer · Oostduinkerke",
    run: async () => {
      const r = await a.weather.getWeather("Oostduinkerke");
      return classify(r.source, !!r.data, r.data ? `${r.data.tempC}° · ${r.data.condition}` : "");
    },
  },
  {
    key: "weather-gistel",
    label: "Weer · Gistel",
    run: async () => {
      const r = await a.weather.getWeather("Gistel");
      return classify(r.source, !!r.data, r.data ? `${r.data.tempC}° · ${r.data.condition}` : "");
    },
  },
  {
    key: "news",
    label: "Nieuws",
    run: async () => {
      const r = await a.news.getHeadlines();
      return classify(r.source, !!r.data?.length, `${r.data?.length ?? 0} headlines`);
    },
  },
  {
    key: "traffic",
    label: "Verkeer",
    run: async () => {
      const r = await a.traffic.getTraffic();
      return classify(r.source, !!r.data, r.data ? `${r.data.fromTo} · ${r.data.durationMin} min` : "");
    },
  },
  {
    key: "workout",
    label: "Workout & timer",
    run: async () => ({ status: "mock", detail: "A/B-oefeningen en countdown beschikbaar" }),
  },
  {
    key: "waste",
    label: "Afval · Guldenzandstraat",
    run: async () => {
      const r = await a.waste.getCollection();
      return classify(r.source, !!r.data, r.data?.address ?? "");
    },
  },
];

const BADGE: Record<Status, { text: string; cls: string }> = {
  idle: { text: "—", cls: "text-text-muted" },
  running: { text: "bezig…", cls: "text-text-mid" },
  ok: { text: "live ✓", cls: "text-emerald" },
  mock: { text: "mock", cls: "text-amber" },
  missing: { text: "ontbreekt", cls: "text-danger" },
};

export default function TestPage() {
  const [results, setResults] = useState<Record<string, { status: Status; detail: string }>>({});

  async function runOne(t: TestDef) {
    setResults((r) => ({ ...r, [t.key]: { status: "running", detail: "" } }));
    const res = await t.run();
    setResults((r) => ({ ...r, [t.key]: res }));
  }

  async function runAll() {
    for (const t of TESTS) await runOne(t);
  }

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-xl font-semibold text-text-high">Testfunctie</h1>
        <button
          type="button"
          onClick={runAll}
          className="rounded-md bg-amber px-4 py-2 text-label-lg font-semibold text-canvas"
        >
          Test alles
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {TESTS.map((t) => {
          const res = results[t.key] ?? { status: "idle" as Status, detail: "" };
          const badge = BADGE[res.status];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => runOne(t)}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/90 p-4 text-left active:opacity-70"
            >
              <div>
                <p className="text-body-lg font-semibold text-text-high">{t.label}</p>
                {res.detail && <p className="text-label-md text-text-mid">{res.detail}</p>}
              </div>
              <span className={`text-label-lg font-semibold ${badge.cls}`}>{badge.text}</span>
            </button>
          );
        })}
      </div>

      <p className="text-label-md text-text-muted">
        “mock” = onderdeel werkt met voorbeelddata; “live ✓” verschijnt zodra een echte
        bron gekoppeld en getest is. “ontbreekt” = geen gegevens.
      </p>
    </main>
  );
}
