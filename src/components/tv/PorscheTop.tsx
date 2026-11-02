"use client";

/**
 * "Porsche · Top 3 van de dag" — de best scorende wagens uit het porsche-tracker-
 * project. Haalt /api/porsche op (server leest het trackerbestand op de Mac).
 * Niet beschikbaar (bv. op de Pi) → de tegel toont niets.
 */

import { useEffect, useState } from "react";

interface Car {
  model: string;
  generatie: string;
  jaar: number | null;
  km: number | null;
  prijs: number | null;
  dealPct: number | null;
  score: number;
}

interface Data {
  available: boolean;
  cars: Car[];
}

function euro(n: number | null): string {
  if (n == null) return "—";
  return "€ " + Math.round(n).toLocaleString("nl-BE");
}

export function PorscheTop() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/porsche");
        const json = (await res.json()) as Data;
        if (active) setData(json);
      } catch {
        /* behoud vorige waarde */
      }
    }
    void load();
    const id = setInterval(load, 10 * 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!data || !data.available || data.cars.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {data.cars.map((c, i) => (
        <li key={i} className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate text-body-md text-text-high">
            <span className="mr-2 font-semibold text-purple">{i + 1}</span>
            {c.model} {c.generatie}
            {c.jaar ? ` · ${c.jaar}` : ""}
          </span>
          <span className="shrink-0 text-label-md text-text-mid">
            <span className="tabular font-semibold text-text-high">{euro(c.prijs)}</span>
            {c.dealPct != null && c.dealPct > 0 ? (
              <span className="ml-2 text-emerald">−{Math.round(c.dealPct)}%</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
