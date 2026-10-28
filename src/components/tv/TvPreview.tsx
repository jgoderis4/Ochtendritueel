"use client";

import { useRoutine } from "@/lib/routine/useRoutine";
import { DashboardScreen } from "./screens/DashboardScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { WorkoutScreen } from "./screens/WorkoutScreen";
import type { TvData } from "./screens/types";

export type PreviewScreen = "welcome" | "dashboard" | "workout";

/**
 * Preview van één vast scherm (routes /tv/welcome · /tv/dashboard · /tv/workout).
 * Toont dat specifieke scherm los en live — ongeacht de huidige routinefase —
 * zodat elk scherm afzonderlijk te bekijken/testen blijft (briefing §7.5).
 * Klok en, voor de workout, de set-countdown lopen live via useRoutine.
 */
export function TvPreview({ screen, data }: { screen: PreviewScreen; data: TvData }) {
  const routine = useRoutine();

  switch (screen) {
    case "welcome":
      return <WelcomeScreen data={data} routine={routine} />;
    case "dashboard":
      return <DashboardScreen data={data} routine={routine} />;
    case "workout":
      return <WorkoutScreen data={data} routine={routine} />;
  }
}
