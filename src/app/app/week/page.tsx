"use client";

import { useEffect, useMemo, useState } from "react";
import { MUSIC_STYLES, type MusicStyle } from "@/lib/settings/types";
import { useApp } from "../AppProvider";

const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const PLAN_KEY = "aura.weekplan.v1"; // per-dag stijl-override (datum → stijl)

/** Dagen sinds epoch — continue index voor doorlopende A/B-afwisseling. */
function dayNumber(d: Date): number {
  return Math.floor(d.getTime() / 86_400_000);
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function WeekPage() {
  const { settings } = useApp();
  const [overrides, setOverrides] = useState<Record<string, MusicStyle>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAN_KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch {
      /* negeer */
    }
  }, []);

  function setStyle(date: string, style: MusicStyle) {
    setOverrides((prev) => {
      const next = { ...prev, [date]: style };
      try {
        localStorage.setItem(PLAN_KEY, JSON.stringify(next));
      } catch {
        /* negeer */
      }
      return next;
    });
  }

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = d.getDay(); // 0 = zondag
      const weekend = dow === 0 || dow === 6;
      const inVacation =
        settings.vacation.enabled &&
        settings.vacation.from != null &&
        settings.vacation.to != null &&
        ymd(d) >= settings.vacation.from &&
        ymd(d) <= settings.vacation.to;
      return {
        date: ymd(d),
        name: DAY_NAMES[dow],
        label: i === 0 ? "Vandaag" : i === 1 ? "Morgen" : d.toLocaleDateString("nl-BE", { day: "numeric", month: "short" }),
        start: weekend ? settings.startWeekend : settings.startWeekday,
        workout: dayNumber(d) % 2 === 0 ? "A · Kracht" : "B · Mobiliteit",
        inVacation,
      };
    });
  }, [settings]);

  return (
    <main className="flex flex-col gap-6">
      <h1 className="font-display text-headline-xl font-semibold text-text-high">
        Weekoverzicht
      </h1>

      <div className="flex flex-col gap-3">
        {days.map((d) => (
          <section
            key={d.date}
            className={`rounded-lg border p-4 ${
              d.inVacation ? "border-border bg-surface/50 opacity-70" : "border-border bg-surface/90"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-lg font-semibold text-text-high">{d.name}</p>
                <p className="text-label-md text-text-muted">{d.label}</p>
              </div>
              <div className="text-right">
                <p className="tabular text-headline-md font-semibold text-amber">{d.start}</p>
                <p className="text-label-md text-text-mid">Workout {d.workout}</p>
              </div>
            </div>

            {d.inVacation ? (
              <p className="mt-3 text-label-md font-medium text-coastal">🏖 Vakantie · routine uit</p>
            ) : (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-label-md text-text-mid">Muziekstijl</span>
                <select
                  value={overrides[d.date] ?? settings.musicStyle}
                  onChange={(e) => setStyle(d.date, e.target.value as MusicStyle)}
                  className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-body-md text-text-high"
                >
                  {MUSIC_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>
        ))}
      </div>

      <p className="text-label-md text-text-muted">
        Starttijd en workouttype volgen uit de instellingen en de doorlopende A/B-afwisseling.
        Per dag kun je de muziekstijl aanpassen; dit wordt lokaal bewaard (Fase 1).
      </p>
    </main>
  );
}
