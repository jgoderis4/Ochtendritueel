"use client";

/**
 * useRoutine — React-brug naar de gedeelde routine-store.
 *
 * - leest de staat via useSyncExternalStore (reageert op elke tab/venster);
 * - tikt elke 500 ms zodat klokken/countdowns live lopen;
 * - "mount-gate": vóór de eerste client-render is `mounted=false` en `now=null`,
 *   zodat tijd-afhankelijke tekst (klok, countdown) pas ná hydratatie verschijnt.
 *   Dat voorkomt hydration-mismatch tussen de (statische) server-render en de
 *   (live) client-render.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import { routineStore } from "./store";
import {
  currentPhase,
  elapsedMs,
  remainingMs,
  workoutElapsedMs,
  type RoutinePhase,
  type RoutineState,
} from "./timeline";

export interface RoutineActions {
  start: () => void;
  togglePause: () => void;
  stop: () => void;
  skipWorkout: () => void;
  startWorkoutEarly: () => void;
}

export interface UseRoutine {
  /** Pas ná client-mount true — gebruik dit als gate voor live tijdweergave. */
  mounted: boolean;
  /** Huidige epoch ms (live), of null vóór mount. */
  now: number | null;
  state: RoutineState;
  phase: RoutinePhase;
  elapsed: number;
  remaining: number;
  workoutElapsed: number;
  actions: RoutineActions;
}

const actions: RoutineActions = {
  start: () => routineStore.start(),
  togglePause: () => routineStore.togglePause(),
  stop: () => routineStore.stop(),
  skipWorkout: () => routineStore.skipWorkout(),
  startWorkoutEarly: () => routineStore.startWorkoutEarly(),
};

export function useRoutine(): UseRoutine {
  const state = useSyncExternalStore(
    routineStore.subscribe,
    routineStore.getState,
    routineStore.getServerSnapshot,
  );

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Mount-gate: zet `now` meteen ná mount (bewust — opent de live weergave),
    // daarna elke 500 ms bijwerken zodat klokken/countdowns lopen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const mounted = now !== null;
  // Vóór mount rekenen we met een neutrale klok; de UI toont dan nog niets
  // tijd-afhankelijks (gate op `mounted`).
  const clock = now ?? state.startedAt ?? 0;

  return {
    mounted,
    now,
    state,
    phase: currentPhase(state, clock),
    elapsed: elapsedMs(state, clock),
    remaining: remainingMs(state, clock),
    workoutElapsed: workoutElapsedMs(state, clock),
    actions,
  };
}
