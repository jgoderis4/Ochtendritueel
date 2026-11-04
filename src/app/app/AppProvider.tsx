"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TIMELINE, type RoutinePhase, type RoutineState } from "@/lib/routine/timeline";
import { useRoutine, type RoutineActions } from "@/lib/routine/useRoutine";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings/types";
import {
  WEEKPLAN_EVENT,
  WEEKPLAN_KEY,
  effectiveStyleForToday,
  readWeekplan,
  type Weekplan,
} from "@/lib/settings/weekplan";

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

  // --- Instellingen (server = bron van waarheid, localStorage = offline cache) ---
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    // 1) Snel: lokale cache tonen zodat de UI niet leeg flikkert.
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* negeer corrupte opslag */
    }
    // 2) Lokale instellingen onthouden voor eventuele migratie.
    let localSettings: Settings | null = null;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) localSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      /* negeer */
    }

    // 3) Server raadplegen.
    void fetch("/api/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { settings?: Partial<Settings>; weekplan?: Weekplan; initialized?: boolean } | null) => {
        if (!data) return;
        if (data.initialized) {
          // Server is leidend: instellingen + weekplanning overnemen.
          const merged = { ...DEFAULT_SETTINGS, ...data.settings };
          setSettingsState(merged);
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
            if (data.weekplan) localStorage.setItem(WEEKPLAN_KEY, JSON.stringify(data.weekplan));
            window.dispatchEvent(new Event(WEEKPLAN_EVENT));
          } catch {
            /* opslag niet beschikbaar */
          }
        } else {
          // Server nog leeg: bestaande telefoon-instellingen éénmalig migreren.
          const weekplan = readWeekplan();
          const payload: { settings?: Settings; weekplan?: Weekplan } = {};
          if (localSettings) payload.settings = localSettings;
          if (Object.keys(weekplan).length) payload.weekplan = weekplan;
          if (payload.settings || payload.weekplan) {
            void fetch("/api/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
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
    // Naar de server zodat alle toestellen én de ochtend-planner op de Pi
    // de nieuwe instellingen gebruiken.
    void fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: patch }),
    }).catch(() => {});
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
