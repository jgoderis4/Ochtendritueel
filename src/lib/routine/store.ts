/**
 * Gedeelde routine-store — de "koppellaag" (D-007).
 *
 * Eén bron van waarheid voor de routine-staat, gedeeld tussen álle open
 * tabs/vensters van /app en /tv in **dezelfde browser/hetzelfde toestel**:
 *   - persistent in localStorage  (sleutel AURA_ROUTINE_KEY)
 *   - live doorgegeven via BroadcastChannel  (direct, zelfde browser)
 *   - fallback via het storage-event  (andere tabs, zonder BroadcastChannel)
 *
 * Framework-agnostisch en SSR-veilig (alle browser-API's achter typeof-guards).
 * Echte cross-device sync (telefoon ↔ aparte tv-kast) vraagt een server/websocket
 * en komt later; alleen deze module hoeft dan vervangen te worden — de UI leidt
 * af via useRoutine() en verandert niet.
 */

import { INITIAL_STATE, type RoutineState } from "./timeline";

const STORAGE_KEY = "aura.routine.v1";
const CHANNEL_NAME = "aura.routine";

type Listener = () => void;

let state: RoutineState = INITIAL_STATE;
let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();
let initialized = false;

/** Lees de staat uit localStorage (defensief: corrupte opslag → INITIAL_STATE). */
function readPersisted(): RoutineState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<RoutineState>;
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return INITIAL_STATE;
  }
}

/** Zorg eenmalig voor de verbinding met opslag + broadcast. */
function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  state = readPersisted();

  // Andere tabs zonder BroadcastChannel: luister op storage-events.
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    state = readPersisted();
    emit();
  });

  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e: MessageEvent) => {
      // De verzender stuurt de volledige nieuwe staat mee.
      if (e.data && typeof e.data === "object") {
        state = { ...INITIAL_STATE, ...(e.data as Partial<RoutineState>) };
        emit();
      }
    };
  }
}

function emit() {
  for (const fn of listeners) fn();
}

/** Schrijf + broadcast een nieuwe staat naar alle luisteraars/tabs. */
function commit(next: RoutineState) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* opslag niet beschikbaar — in-memory werkt alsnog in deze tab */
    }
    channel?.postMessage(next);
  }
  emit();
}

export const routineStore = {
  /** Huidige staat (client). */
  getState(): RoutineState {
    ensureInit();
    return state;
  },

  /** Stabiele serverwaarde voor useSyncExternalStore (geen browser-API). */
  getServerSnapshot(): RoutineState {
    return INITIAL_STATE;
  },

  /** Abonneer op wijzigingen; geeft een opzeg-functie terug. */
  subscribe(fn: Listener): () => void {
    ensureInit();
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  // --- Acties (pauze- en offset-logica, los van React) ---

  start() {
    commit({ ...INITIAL_STATE, startedAt: Date.now() });
  },

  stop() {
    commit(INITIAL_STATE);
  },

  togglePause() {
    const s = routineStore.getState();
    if (s.startedAt === null) return;
    if (s.paused) {
      const extra = s.pausedAt ? Math.max(0, Date.now() - s.pausedAt) : 0;
      commit({ ...s, paused: false, pausedAt: null, pausedMs: s.pausedMs + extra });
    } else {
      commit({ ...s, paused: true, pausedAt: Date.now() });
    }
  },

  skipWorkout() {
    const s = routineStore.getState();
    commit({ ...s, workoutSkipped: true, workoutStartOffsetMs: null });
  },

  startWorkoutEarly() {
    const s = routineStore.getState();
    if (s.startedAt === null) return;
    // Leg de workoutstart vast op de verstreken routinetijd van nu.
    const now = Date.now();
    let elapsed = now - s.startedAt - s.pausedMs;
    if (s.paused && s.pausedAt != null) elapsed -= Math.max(0, now - s.pausedAt);
    commit({
      ...s,
      workoutSkipped: false,
      workoutStartOffsetMs: Math.max(0, elapsed),
    });
  },
};
