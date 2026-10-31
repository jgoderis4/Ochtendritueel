"use client";

import { useEffect, useRef } from "react";
import { getAdapters } from "@/lib/adapters";
import { useRoutine } from "@/lib/routine/useRoutine";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EndedScreen } from "./screens/EndedScreen";
import { IdleScreen } from "./screens/IdleScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { WorkoutScreen } from "./screens/WorkoutScreen";
import type { TvData } from "./screens/types";

/**
 * TV-runtime (kiosk-ingang op /tv). Leidt uit de gedeelde routine-store live af
 * welk scherm hoort bij de huidige fase en wisselt automatisch:
 *   standby → welkom → dashboard → workout → dashboard → afgerond.
 * Eén klokbron (useRoutine) voor het hele scherm; geen navigatie, geen flikkering.
 * Vóór client-mount tonen we het standby-scherm (neutrale placeholder).
 *
 * De TV-runtime is tevens de "eigenaar" van de apparaatbesturing (de Pi draait
 * dit scherm 24/7): bij routinestart begint automatisch de rustige ochtendmuziek
 * op de Sonos, bij einde/stop stopt ze. (Eén kiosk verwacht; meerdere open
 * TV-schermen zouden dit dubbel triggeren.)
 */
export function TvRuntime({ data }: { data: TvData }) {
  const routine = useRoutine();
  const { mounted, phase, state } = routine;

  // --- Automatische muziek: aan bij start, uit bij einde/stop ---
  const musicOnRef = useRef(false);
  const musicActive = mounted && state.startedAt !== null && phase !== "ended";
  useEffect(() => {
    const music = getAdapters().music;
    if (musicActive && !musicOnRef.current) {
      musicOnRef.current = true;
      void music.play().catch(() => {});
    } else if (!musicActive && musicOnRef.current) {
      musicOnRef.current = false;
      void music.stop().catch(() => {});
    }
  }, [musicActive]);

  // Vóór mount of wanneer er geen routine loopt: standby.
  if (!mounted || state.startedAt === null) {
    return <IdleScreen data={data} routine={routine} />;
  }

  switch (phase) {
    case "welcome":
      return <WelcomeScreen data={data} routine={routine} />;
    case "dashboard":
      return <DashboardScreen data={data} routine={routine} />;
    case "workout":
      return <WorkoutScreen data={data} routine={routine} />;
    case "ended":
    default:
      return <EndedScreen data={data} routine={routine} />;
  }
}
