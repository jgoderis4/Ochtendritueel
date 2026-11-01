/**
 * Routine-store (client) — gedeelde status OVER TOESTELLEN HEEN (D-007).
 *
 * Bron van waarheid = de server (/api/routine). Alle toestellen (gsm, laptop, tv)
 * lezen dezelfde status: de client pollt periodiek en stuurt acties als POST.
 * Zo volgt je laptop live wat je op je gsm start. De server stuurt de muziek aan.
 *
 * BELANGRIJK: getState() is PUUR (geen side-effects) — React roept het vaak aan.
 * Alle setup (eerste fetch + polling) gebeurt in subscribe(). De laatst bekende
 * status wordt in localStorage gecachet voor een directe eerste render.
 */

import { INITIAL_STATE, type RoutineState } from "./timeline";
import type { RoutineAction } from "./transitions";

const CACHE_KEY = "aura.routine.v1";
const POLL_MS = 2000;

type Listener = () => void;

function readCache(): RoutineState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...(JSON.parse(raw) as Partial<RoutineState>) };
  } catch {
    return INITIAL_STATE;
  }
}

// Begincache meteen bij module-load op de client → getState kan puur blijven.
let state: RoutineState = typeof window !== "undefined" ? readCache() : INITIAL_STATE;
let rev = -1;
const listeners = new Set<Listener>();
let pollTimer: ReturnType<typeof setInterval> | null = null;

function emit() {
  for (const fn of listeners) fn();
}

function writeCache(s: RoutineState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* opslag niet beschikbaar */
  }
}

/** Neem een server-antwoord over als het nieuwer is. */
function adopt(next: { state: RoutineState; rev: number }) {
  if (next.rev === rev) return;
  rev = next.rev;
  state = { ...INITIAL_STATE, ...next.state };
  writeCache(state);
  emit();
}

async function fetchServer() {
  try {
    const res = await fetch("/api/routine", { cache: "no-store" });
    if (!res.ok) return;
    adopt((await res.json()) as { state: RoutineState; rev: number });
  } catch {
    /* server even niet bereikbaar — behoud huidige status */
  }
}

async function dispatch(action: RoutineAction) {
  try {
    const res = await fetch("/api/routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: action.type, now: Date.now() }),
    });
    if (!res.ok) return;
    adopt((await res.json()) as { state: RoutineState; rev: number });
  } catch {
    /* actie kon niet verzonden worden */
  }
}

/** Start de polling één keer (idempotent). */
function startPolling() {
  if (pollTimer !== null || typeof window === "undefined") return;
  void fetchServer();
  pollTimer = setInterval(() => void fetchServer(), POLL_MS);
}

export const routineStore = {
  /** PUUR: geen side-effects (React roept dit vaak aan). */
  getState(): RoutineState {
    return state;
  },

  getServerSnapshot(): RoutineState {
    return INITIAL_STATE;
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    startPolling();
    return () => {
      listeners.delete(fn);
    };
  },

  // --- Acties: naar de server, antwoord wordt lokaal overgenomen ---
  start() {
    void dispatch({ type: "start" });
  },
  stop() {
    void dispatch({ type: "stop" });
  },
  togglePause() {
    void dispatch({ type: "togglePause" });
  },
  skipWorkout() {
    void dispatch({ type: "skipWorkout" });
  },
  startWorkoutEarly() {
    void dispatch({ type: "startWorkoutEarly" });
  },
  skipExercise() {
    void dispatch({ type: "skipExercise" });
  },
  snooze() {
    void dispatch({ type: "snooze" });
  },
};
