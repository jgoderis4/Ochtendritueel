"use client";

/**
 * Algemeen filebeeld voor België (hoeveel files op de wegen). Haalt /api/traffic/belgium
 * op (TomTom), ververst elke 3 min. Zonder TomTom-sleutel of bij falen: nette melding.
 */

import { useEffect, useState } from "react";

interface JamSpot {
  road: string;
  where: string;
  delayMin: number;
}

interface Data {
  available: boolean;
  jams: number;
  significant: number;
  level: "vlot" | "beperkt" | "druk" | "zwaar";
  top: JamSpot[];
}

const LEVEL: Record<Data["level"], { label: string; color: string }> = {
  vlot: { label: "Vlot verkeer", color: "text-emerald" },
  beperkt: { label: "Beperkt druk", color: "text-coastal" },
  druk: { label: "Druk", color: "text-amber" },
  zwaar: { label: "Zwaar", color: "text-danger" },
};

export function BelgiumTraffic() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/traffic/belgium");
        const json = (await res.json()) as Data;
        if (active) setData(json);
      } catch {
        /* behoud vorige waarde */
      }
    }
    void load();
    const id = setInterval(load, 180_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!data) {
    return <p className="text-body-md text-text-mid">Filebeeld wordt geladen…</p>;
  }
  if (!data.available) {
    return <p className="text-label-md text-text-muted">Live filebeeld niet beschikbaar.</p>;
  }

  const lvl = LEVEL[data.level];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-headline-lg font-semibold ${lvl.color}`}>{lvl.label}</p>
          <p className="text-label-md text-text-mid">
            {data.significant === 0
              ? data.jams === 0
                ? "Geen files op de Belgische wegen"
                : "Enkel korte vertragingen"
              : `${data.significant} file${data.significant > 1 ? "s" : ""} met vertraging (≥ 5 min)`}
          </p>
        </div>
        <span className="text-5xl" aria-hidden>
          {data.level === "vlot" ? "🟢" : data.level === "beperkt" ? "🔵" : data.level === "druk" ? "🟠" : "🔴"}
        </span>
      </div>

      {data.top.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-t border-border pt-3">
          {data.top.map((s, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-body-md text-text-high">
                <span className="font-semibold text-coastal">{s.road}</span>
                {s.where ? ` · ${s.where}` : ""}
              </span>
              <span className="shrink-0 tabular text-label-md font-semibold text-amber">+{s.delayMin} min</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
