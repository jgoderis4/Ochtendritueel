/**
 * Gedeelde instellingen + weekplanning over toestellen heen (en voor de
 * ochtend-planner op de Pi). GET levert de huidige configuratie; POST werkt
 * instellingen en/of de weekplanning bij.
 */
import { serverSettings } from "@/lib/settings/server-store";
import type { Settings } from "@/lib/settings/types";
import type { DayPlan, Weekplan } from "@/lib/settings/weekplan";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(serverSettings.get());
}

export async function POST(request: Request) {
  let body: {
    settings?: Partial<Settings>;
    weekplan?: Weekplan;
    dayPlan?: { date: string; patch: DayPlan };
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ongeldige body" }, { status: 400 });
  }

  if (body.settings) serverSettings.updateSettings(body.settings);
  if (body.weekplan) serverSettings.setWeekplan(body.weekplan);
  if (body.dayPlan?.date) serverSettings.setDayPlan(body.dayPlan.date, body.dayPlan.patch ?? {});

  return Response.json(serverSettings.get());
}
