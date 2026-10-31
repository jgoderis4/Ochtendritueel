/**
 * Pure routine-overgangen (geen IO, geen React). Eén set regels die zowel de
 * server (gedeelde status) als de client gebruikt, zodat het gedrag identiek is.
 * Tijd wordt expliciet als `now` (epoch ms) doorgegeven → testbaar en SSR-veilig.
 */

import { INITIAL_STATE, workoutElapsedMs, type RoutineState } from "./timeline";
import { workoutForDayIndex } from "./workouts";
import { workoutProgress } from "./workout-engine";

export type RoutineAction =
  | { type: "start" }
  | { type: "stop" }
  | { type: "togglePause" }
  | { type: "skipWorkout" }
  | { type: "startWorkoutEarly" }
  | { type: "skipExercise" };

/** Dagindex voor de A/B-afwisseling (zelfde regel als het workoutscherm). */
function dayIndexFor(now: number): number {
  return Math.floor(now / 86_400_000);
}

export function applyAction(state: RoutineState, action: RoutineAction, now: number): RoutineState {
  switch (action.type) {
    case "start":
      return { ...INITIAL_STATE, startedAt: now };

    case "stop":
      return INITIAL_STATE;

    case "togglePause": {
      if (state.startedAt === null) return state;
      if (state.paused) {
        const extra = state.pausedAt ? Math.max(0, now - state.pausedAt) : 0;
        return { ...state, paused: false, pausedAt: null, pausedMs: state.pausedMs + extra };
      }
      return { ...state, paused: true, pausedAt: now };
    }

    case "skipWorkout":
      return { ...state, workoutSkipped: true, workoutStartOffsetMs: null };

    case "startWorkoutEarly": {
      if (state.startedAt === null) return state;
      let elapsed = now - state.startedAt - state.pausedMs;
      if (state.paused && state.pausedAt != null) elapsed -= Math.max(0, now - state.pausedAt);
      return { ...state, workoutSkipped: false, workoutStartOffsetMs: Math.max(0, elapsed) };
    }

    case "skipExercise": {
      if (state.startedAt === null) return state;
      // Resterende tijd van de huidige oefening vooruitschuiven → volgende oefening.
      const workout = workoutForDayIndex(dayIndexFor(now));
      const elapsed = workoutElapsedMs(state, now);
      const prog = workoutProgress(workout, elapsed);
      const addMs = Math.max(0, prog.secondsLeftInExercise) * 1000;
      return { ...state, workoutSkipMs: state.workoutSkipMs + addMs };
    }

    default:
      return state;
  }
}
