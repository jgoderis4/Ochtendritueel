/**
 * Gedeelde routine-status op de SERVER (de Mac/Pi). Eén bron van waarheid voor
 * alle toestellen: gsm én laptop/tv lezen en wijzigen dezelfde status via
 * /api/routine. Zo volgt de laptop live wat je op je gsm doet.
 *
 * In-memory (reset bij herstart dev-server; later evt. naar bestand/db). De server
 * is tevens eigenaar van de apparaatbesturing: bij start speelt de muziek op de
 * Sonos, bij stop/pauze/einde stopt ze — exact één keer, los van hoeveel
 * toestellen er meekijken.
 */

import { pause as sonosPause, play as sonosPlay } from "@/lib/music/sonos";
import { currentPhase, INITIAL_STATE, remainingMs, type RoutineState } from "./timeline";
import { applyAction, type RoutineAction } from "./transitions";

let state: RoutineState = INITIAL_STATE;
let rev = 0;
let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

function isRunning(s: RoutineState, now: number): boolean {
  return s.startedAt !== null && currentPhase(s, now) !== "ended";
}

/** (Her)plan de automatische muziekstop op het natuurlijke einde van de routine. */
function scheduleAutoStop(now: number) {
  if (autoStopTimer) {
    clearTimeout(autoStopTimer);
    autoStopTimer = null;
  }
  if (!isRunning(state, now) || state.paused) return;
  const left = remainingMs(state, now);
  if (left <= 0) return;
  autoStopTimer = setTimeout(() => {
    autoStopTimer = null;
    void sonosPause().catch(() => {});
  }, left);
}

/** Voert de muziekbesturing uit die bij een overgang hoort. */
function reconcileMusic(action: RoutineAction, next: RoutineState) {
  switch (action.type) {
    case "start":
      void sonosPlay().catch(() => {});
      break;
    case "stop":
      void sonosPause().catch(() => {});
      break;
    case "togglePause":
      if (next.paused) void sonosPause().catch(() => {});
      else void sonosPlay().catch(() => {});
      break;
    default:
      break;
  }
}

export const serverRoutine = {
  get(): { state: RoutineState; rev: number } {
    return { state, rev };
  },

  dispatch(action: RoutineAction, now: number): { state: RoutineState; rev: number } {
    const next = applyAction(state, action, now);
    // Alleen muziek/timer aanpassen als er echt iets wijzigt.
    const changed = JSON.stringify(next) !== JSON.stringify(state);
    state = next;
    if (changed) {
      rev += 1;
      reconcileMusic(action, next);
      scheduleAutoStop(now);
    }
    return { state, rev };
  },
};
