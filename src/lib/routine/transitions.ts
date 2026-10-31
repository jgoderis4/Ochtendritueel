/**
 * Pure routine-overgangen (geen IO, geen React). Eén set regels die zowel de
 * server (gedeelde status) als de client gebruikt, zodat het gedrag identiek is.
 * Tijd wordt expliciet als `now` (epoch ms) doorgegeven → testbaar en SSR-veilig.
 */

import { INITIAL_STATE, type RoutineState } from "./timeline";

export type RoutineAction =
  | { type: "start" }
  | { type: "stop" }
  | { type: "togglePause" }
  | { type: "skipWorkout" }
  | { type: "startWorkoutEarly" };

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

    default:
      return state;
  }
}
