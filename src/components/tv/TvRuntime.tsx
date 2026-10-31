"use client";

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
 * De routine-status is gedeeld via de server, dus dit scherm volgt live wat er op
 * de gsm gebeurt. De muziek wordt server-side aangestuurd (zie /api/routine),
 * niet hier — zo speelt ze precies één keer, ongeacht het aantal schermen.
 */
export function TvRuntime({ data }: { data: TvData }) {
  const routine = useRoutine();
  const { mounted, phase, state } = routine;

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
