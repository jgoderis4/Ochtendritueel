"use client";

/**
 * Live "ontdek-weetje" uit de Nederlandse Wikipedia — altijd nieuw, nooit herhaald.
 * Haalt bij mount een willekeurig weetje op en ververst periodiek. Faalt het
 * (geen internet), dan toont het niets (de gecureerde weetjes blijven staan).
 * Bedoeld als 3e item in de weetjes-tegel.
 */

import { useEffect, useState } from "react";

const REFRESH_MS = 10 * 60_000;

export function DiscoverFact({ index }: { index: number }) {
  const [fact, setFact] = useState<{ title: string; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/facts/discover");
        const json = (await res.json()) as { title: string | null; text?: string };
        if (active && json.title && json.text) setFact({ title: json.title, text: json.text });
      } catch {
        /* laat de huidige waarde staan */
      }
    }
    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!fact) return null;

  return (
    <li className="flex items-baseline gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-coastal/20 text-label-md font-semibold text-coastal">
        {index}
      </span>
      <p className="text-body-md text-text-high">
        <span className="font-semibold text-coastal">{fact.title}:</span> {fact.text}{" "}
        <span className="text-label-md text-text-muted">· via Wikipedia</span>
      </p>
    </li>
  );
}
