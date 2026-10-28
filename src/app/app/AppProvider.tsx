"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  INITIAL_STATE,
  TIMELINE,
  currentPhase,
  elapsedMs,
  remainingMs,
  type RoutinePhase,
  type RoutineState,
} from "@/lib/routine/timeline";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings/types";

interface RoutineActions {
  start: () => void;
  togglePause: () => void;
  stop: () => void;
  skipWorkout: () => void;
  startWorkoutEarly: () => void;
}

interface AppContextValue {
  now: number;
  state: RoutineState;
  phase: RoutinePhase;
  elapsed: number;
  remaining: number;
  actions: RoutineActions;
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const SETTINGS_KEY = "aura.settings.v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  // --- Routine-staat (niet persistent: een routine hoort bij één ochtend) ---
  const [state, setState] = useState<RoutineState>(INITIAL_STATE);
  const pauseStartedAt = useRef<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Tik elke 500ms zodat countdowns live lopen.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const start = useCallback(() => {
    pauseStartedAt.current = null;
    setState({ ...INITIAL_STATE, startedAt: Date.now() });
  }, []);

  const stop = useCallback(() => {
    pauseStartedAt.current = null;
    setState(INITIAL_STATE);
  }, []);

  const togglePause = useCallback(() => {
    setState((s) => {
      if (s.startedAt === null) return s;
      if (s.paused) {
        // Hervatten: opgebouwde pauzeduur bijtellen.
        const extra = pauseStartedAt.current ? Date.now() - pauseStartedAt.current : 0;
        pauseStartedAt.current = null;
        return { ...s, paused: false, pausedMs: s.pausedMs + extra };
      }
      pauseStartedAt.current = Date.now();
      return { ...s, paused: true };
    });
  }, []);

  const skipWorkout = useCallback(() => {
    setState((s) => ({ ...s, workoutSkipped: true, workoutStartedAt: null }));
  }, []);

  const startWorkoutEarly = useCallback(() => {
    setState((s) =>
      s.startedAt === null
        ? s
        : { ...s, workoutSkipped: false, workoutStartedAt: Date.now() },
    );
  }, []);

  // Terwijl gepauzeerd telt de tijd niet door: houd pausedMs virtueel bij.
  const effectiveState = useMemo<RoutineState>(() => {
    if (state.paused && pauseStartedAt.current) {
      return { ...state, pausedMs: state.pausedMs + (now - pauseStartedAt.current) };
    }
    return state;
  }, [state, now]);

  const phase = currentPhase(effectiveState, now);
  const elapsed = elapsedMs(effectiveState, now);
  const remaining = remainingMs(effectiveState, now);

  // --- Instellingen (persistent in localStorage) ---
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* negeer corrupte opslag */
    }
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* opslag niet beschikbaar */
      }
      return next;
    });
  }, []);

  const value: AppContextValue = {
    now,
    state: effectiveState,
    phase,
    elapsed,
    remaining,
    actions: { start, togglePause, stop, skipWorkout, startWorkoutEarly },
    settings,
    setSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp moet binnen <AppProvider> gebruikt worden");
  return ctx;
}

export { TIMELINE };
