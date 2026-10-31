/**
 * Routine-store (client) — nu met gedeelde status OVER TOESTELLEN HEEN (D-007).
 *
 * Bron van waarheid = de server (/api/routine). Alle toestellen (gsm, laptop, tv)
 * lezen dezelfde status: de client pollt elke ~1,5s en stuurt acties als POST.
 * Zo volgt je laptop live wat je op je gsm start. De server stuurt de muziek aan.
 *
 * Voor een directe eerste render bewaren we de laatst bekende status in
 * localStorage (cache). Framework-agnostisch en SSR-veilig (browser-API's achter
 * typeof-guards). De UI leidt af via useRoutine() en verandert niet.
 */

import { INITIAL_STATE, type RoutineState } from "./timeline";
import type { RoutineAction } from "./transitions";

const CACHE_KEY = "aura.routine.v1";
const POLL_MS = 1500;

type Listener = () => void;

let state: RoutineState = INITIAL_STATE;
let rev = -1;
const listeners = new Set<Listener>();
let initialized = false;
let pollTimer: ReturnType<typeof setInterval> | null = null;

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

function writeCache(s: RoutineState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* opslag niet beschikbaar */
  }
}

function emit() {
  for (const fn of listeners) fn();
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

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  state = readCache();
  void fetchServer();
  pollTimer = setInterval(() => void fetchServer(), POLL_MS);
}

export const routineStore = {
  getState(): RoutineState {
    ensureInit();
    return state;
  },

  getServerSnapshot(): RoutineState {
    return INITIAL_STATE;
  },

  subscribe(fn: Listener): () => void {
    ensureInit();
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
      if (listeners.size === 0 && pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        initialized = false;
      }
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
};
