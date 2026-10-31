"use client";

import { useEffect, useMemo, useRef } from "react";
import { getAdapters } from "@/lib/adapters";
import { formatCountdown, TIMELINE } from "@/lib/routine/timeline";
import { useApp } from "./AppProvider";

const PHASE_LABEL: Record<string, string> = {
  welcome: "Welkomstscherm",
  dashboard: "Dashboard",
  workout: "Workout",
  ended: "Niet actief",
};

export default function ControlPage() {
  const { phase, state, elapsed, remaining, actions, settings } = useApp();
  const running = state.startedAt !== null && phase !== "ended";

  // --- Muziek volgt de routine: start → aan, stop/einde → uit ---
  const music = useMemo(() => getAdapters().music, []);
  const prevRunning = useRef(false);
  useEffect(() => {
    if (!prevRunning.current && running) {
      void music.play().catch(() => {});
    } else if (prevRunning.current && !running) {
      void music.stop().catch(() => {});
    }
    prevRunning.current = running;
  }, [running, music]);

  // Start/stop + pauze die ook de muziek meeneemt.
  function handleStart() {
    actions.start();
  }
  function handleStop() {
    actions.stop();
  }
  function handleTogglePause() {
    const wasPaused = state.paused;
    actions.togglePause();
    if (wasPaused) {
      void music.play().catch(() => {});
    } else {
      void music.stop().catch(() => {});
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <header>
        <p className="text-label-lg font-semibold uppercase tracking-[0.06em] text-emerald">
          Aura · bediening
        </p>
        <h1 className="font-display text-headline-xl font-semibold text-text-high">
          Ochtendroutine
        </h1>
      </header>

      {/* Live statuskaart */}
      <section className="rounded-lg border border-border bg-surface/90 p-6">
        <div className="flex items-center justify-between">
          <span className="text-label-md uppercase tracking-[0.04em] text-text-mid">
            Huidige fase
          </span>
          <span
            className={`inline-flex items-center gap-2 text-label-md font-medium ${
              running ? "text-emerald" : "text-text-muted"
            }`}
          >
            <span className={`size-2 rounded-full ${running ? "bg-emerald" : "bg-text-muted"}`} />
            {running ? "Actief" : "Gestopt"}
            {state.paused && " · gepauzeerd"}
          </span>
        </div>
        <p className="mt-2 font-display text-display-metric font-semibold text-text-high">
          {PHASE_LABEL[phase]}
        </p>

        {running ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-label-md text-text-mid">Resterend tot einde</span>
              <span className="tabular font-display text-headline-lg font-semibold text-amber">
                {formatCountdown(remaining)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-amber transition-[width] duration-500"
                style={{ width: `${Math.min(100, (elapsed / TIMELINE.hardEnd) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-body-md text-text-mid">
            Standaard start: werkdag {settings.startWeekday}, weekend {settings.startWeekend}.
          </p>
        )}
      </section>

      {/* Knoppen */}
      <section className="flex flex-col gap-3">
        {!running ? (
          <Button tone="primary" onClick={handleStart}>
            Start mijn ochtendroutine nu
          </Button>
        ) : (
          <>
            <Button tone="default" onClick={handleTogglePause}>
              {state.paused ? "Hervatten" : "Pauzeer alles"}
            </Button>
            <Button tone="default" onClick={handleStop}>
              Stop alles
            </Button>
            {phase !== "workout" && !state.workoutSkipped && (
              <Button tone="default" onClick={actions.startWorkoutEarly}>
                Workout nu starten
              </Button>
            )}
            {phase !== "workout" && (
              <Button tone="ghost" onClick={actions.skipWorkout}>
                {state.workoutSkipped ? "Workout overgeslagen ✓" : "Work-out overslaan"}
              </Button>
            )}
          </>
        )}
      </section>

      <p className="text-label-md text-text-muted">
        Starten/stoppen stuurt automatisch de muziek op de Sonos aan. Tv aan/uit bij
        start/stop volgt met de Pi-opstelling (afhankelijk van het tv-model).
      </p>
    </main>
  );
}

function Button({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "primary" | "default" | "ghost";
}) {
  const cls = {
    primary: "bg-amber text-canvas",
    default: "bg-surface-2 text-text-high border border-border",
    ghost: "bg-transparent text-text-mid border border-border",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md ${cls} px-5 py-4 text-left text-body-lg font-semibold transition-opacity active:opacity-70`}
    >
      {children}
    </button>
  );
}
