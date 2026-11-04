"use client";

import { useEffect, useMemo, useState } from "react";
import { MUSIC_STYLES, type MusicStyle } from "@/lib/settings/types";
import {
  readWeekplan,
  setDayPlan,
  WEEKPLAN_EVENT,
  type Weekplan,
  ymd,
} from "@/lib/settings/weekplan";
import { useApp } from "../AppProvider";

const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

/** Dagen sinds epoch — continue index voor doorlopende A/B-afwisseling. */
function dayNumber(d: Date): number {
  return Math.floor(d.getTime() / 86_400_000);
}

export default function WeekPage() {
  const { settings } = useApp();
  const [plan, setPlan] = useState<Weekplan>({});

  useEffect(() => {
    // Per-dag overrides uit opslag laden bij mount (bewust patroon).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan(readWeekplan());
    // Opnieuw lezen wanneer de server-planning binnenkomt (hydratie) of een
    // ander toestel/tab wijzigt.
    const onChange = () => setPlan(readWeekplan());
    window.addEventListener(WEEKPLAN_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(WEEKPLAN_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function update(date: string, patch: Parameters<typeof setDayPlan>[1]) {
    setPlan(setDayPlan(date, patch));
    window.dispatchEvent(new Event(WEEKPLAN_EVENT));
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
        defaultStart: weekend ? settings.startWeekend : settings.startWeekday,
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
        {days.map((d) => {
          const dp = plan[d.date] ?? {};
          const off = dp.off === true;
          const start = dp.start ?? d.defaultStart;
          const style = dp.style ?? settings.musicStyle;
          return (
            <section
              key={d.date}
              className={`rounded-lg border p-4 ${
                d.inVacation || off ? "border-border bg-surface/50 opacity-70" : "border-border bg-surface/90"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-lg font-semibold text-text-high">{d.name}</p>
                  <p className="text-label-md text-text-muted">{d.label}</p>
                </div>
                <div className="text-right">
                  {d.inVacation ? (
                    <p className="text-label-md font-medium text-coastal">🏖 Vakantie</p>
                  ) : off ? (
                    <p className="text-label-md font-medium text-text-mid">😴 Uitslapen</p>
                  ) : (
                    <p className="tabular text-headline-md font-semibold text-amber">{start}</p>
                  )}
                  <p className="text-label-md text-text-mid">Workout {d.workout}</p>
                </div>
              </div>

              {d.inVacation ? (
                <p className="mt-3 text-label-md font-medium text-coastal">🏖 Vakantie · routine uit</p>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {/* Niet starten (uitslapen) */}
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-text-mid">Deze dag starten?</span>
                    <button
                      type="button"
                      onClick={() => update(d.date, { off: !off })}
                      className={`rounded-md border px-3 py-1.5 text-label-md font-semibold transition-colors ${
                        off
                          ? "border-border bg-surface-2 text-text-mid"
                          : "border-emerald/40 bg-emerald/15 text-emerald"
                      }`}
                    >
                      {off ? "Uit · uitslapen 😴" : "Aan"}
                    </button>
                  </div>

                  {/* Start-uur (enkel relevant als de dag aan staat) */}
                  {!off && (
                    <div className="flex items-center justify-between">
                      <span className="text-label-md text-text-mid">Start-uur</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={start}
                          onChange={(e) => update(d.date, { start: e.target.value })}
                          className="tabular rounded-md border border-border bg-surface-2 px-3 py-1.5 text-body-md text-text-high"
                        />
                        {dp.start != null && (
                          <button
                            type="button"
                            onClick={() => update(d.date, { start: undefined })}
                            className="rounded-md border border-border px-2 py-1.5 text-label-md text-text-muted"
                            title="Terug naar standaarduur"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Muziekstijl */}
                  {!off && (
                    <div className="flex items-center justify-between">
                      <span className="text-label-md text-text-mid">Muziekstijl</span>
                      <select
                        value={style}
                        onChange={(e) => update(d.date, { style: e.target.value as MusicStyle })}
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
                </div>
              )}
            </section>
          );
        })}
      </div>

      <p className="text-label-md text-text-muted">
        Per dag kun je het start-uur aanpassen, een dag uitzetten (uitslapen) en de
        muziekstijl kiezen. Het standaard start-uur en workouttype volgen uit de
        instellingen en de doorlopende A/B-afwisseling. Lokaal bewaard (Fase 1).
      </p>
    </main>
  );
}
