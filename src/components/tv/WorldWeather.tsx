"use client";

/**
 * "Elders in de wereld" — roterende weertegel die om de 30 s van stad wisselt.
 * Haalt het weer van alle steden in één keer op (/api/weather/world), ververst
 * elke 15 min, en laat de weergave elke 30 s doorschuiven.
 */

import { useEffect, useState } from "react";

interface WorldWeatherItem {
  name: string;
  country: string;
  tempC: number;
  condition: string;
  emoji: string;
}

const ROTATE_MS = 30_000;
const REFRESH_MS = 15 * 60_000;

export function WorldWeather() {
  const [cities, setCities] = useState<WorldWeatherItem[]>([]);
  const [idx, setIdx] = useState(0);

  // Weer ophalen (bij mount + elke 15 min).
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/weather/world");
        const json = (await res.json()) as { cities?: WorldWeatherItem[] };
        if (active && json.cities) setCities(json.cities);
      } catch {
        /* laat de huidige lijst staan */
      }
    }
    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Elke 30 s doorschuiven naar de volgende stad.
  useEffect(() => {
    if (cities.length === 0) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % cities.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [cities.length]);

  if (cities.length === 0) return null;
  const city = cities[idx % cities.length];

  return (
    <div className="mt-1 border-t border-border pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">
          ✈ Elders in de wereld
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {cities.map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full ${i === idx % cities.length ? "bg-amber" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
      <div
        key={city.name}
        className="flex items-center justify-between rounded-md border border-border bg-surface-2/60 px-5 py-4"
      >
        <div>
          <p className="text-headline-md font-semibold text-text-high">
            {city.emoji} {city.name}
          </p>
          <p className="text-label-md text-text-mid">
            {city.country} · {city.condition}
          </p>
        </div>
        <p className="tabular font-display text-4xl font-semibold text-text-high">
          {city.tempC}°
        </p>
      </div>
    </div>
  );
}
