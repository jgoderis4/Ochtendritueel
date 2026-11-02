"use client";

/**
 * "Deze week" — compacte weekverwachting voor Oostduinkerke. Vervangt de vroegere
 * roterende wereldweertegel. Haalt /api/weather/forecast op en ververst elk half uur.
 * Toont per dag: dagnaam, emoji, max/min en regenkans. Vaste indeling (geen rotatie).
 */

import { useEffect, useState } from "react";

interface ForecastDay {
  date: string;
  dayLabel: string;
  tempMaxC: number;
  tempMinC: number;
  rainChancePct: number;
  condition: string;
  emoji: string;
}

const REFRESH_MS = 30 * 60_000;

export function WeekForecast() {
  const [days, setDays] = useState<ForecastDay[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/weather/forecast?location=Oostduinkerke");
        const json = (await res.json()) as { days?: ForecastDay[] };
        if (active && json.days) setDays(json.days);
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

  if (days.length === 0) return null;

  return (
    <div className="mt-1 border-t border-border pt-4">
      <p className="mb-2 text-label-md uppercase tracking-[0.04em] text-text-mid">
        📅 Deze week · Oostduinkerke
      </p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div
            key={d.date}
            className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface-2/60 px-1 py-2"
          >
            <span className="text-label-md font-semibold uppercase text-text-mid">
              {i === 0 ? "vd" : d.dayLabel}
            </span>
            <span className="text-2xl leading-none" title={d.condition}>
              {d.emoji}
            </span>
            <span className="tabular text-body-md font-semibold text-text-high">
              {d.tempMaxC}°
            </span>
            <span className="tabular text-label-md text-text-mid">{d.tempMinC}°</span>
            <span className="tabular text-label-md text-coastal">💧{d.rainChancePct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
