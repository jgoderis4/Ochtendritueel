"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TIMELINE, type RoutinePhase, type RoutineState } from "@/lib/routine/timeline";
import { useRoutine, type RoutineActions } from "@/lib/routine/useRoutine";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings/types";
import { WEEKPLAN_EVENT, effectiveStyleForToday } from "@/lib/settings/weekplan";

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
  // --- Routine-staat: komt nu uit de gedeelde store (sync met /tv) ---
  const routine = useRoutine();

  // --- Instellingen (persistent in localStorage) ---
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      // Eenmalig instellingen uit opslag laden bij mount (bewust patroon).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* negeer corrupte opslag */
    }
  }, []);

  // Muziekstijl + volume naar de server sturen zodat de routine-start de juiste
  // Spotify-muziek op de Sonos zoekt/afspeelt (server stuurt de muziek aan).
  // We sturen de EFFECTIEVE stijl van vandaag: de per-dag-override uit de
  // weekplanning indien aanwezig, anders de algemene standaard uit instellingen.
  const pushPrefs = useCallback(() => {
    void fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "setPrefs",
        style: effectiveStyleForToday(settings.musicStyle),
        volume: settings.volume,
      }),
    }).catch(() => {});
  }, [settings.musicStyle, settings.volume]);

  // Sync bij start, bij wijziging van stijl/volume in instellingen,
  // en wanneer de weekplanning wijzigt (zelfde tab via custom event,
  // andere tab/toestel via storage-event).
  useEffect(() => {
    pushPrefs();
    const onChange = () => pushPrefs();
    window.addEventListener(WEEKPLAN_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(WEEKPLAN_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [pushPrefs]);

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
    // Dezelfde vorm als voorheen, zodat /app-pagina's ongewijzigd blijven.
    now: routine.now ?? 0,
    state: routine.state,
    phase: routine.phase,
    elapsed: routine.elapsed,
    remaining: routine.remaining,
    actions: routine.actions,
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
