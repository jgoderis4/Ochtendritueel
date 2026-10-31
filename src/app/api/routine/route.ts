/**
 * Gedeelde routine-status over toestellen heen. GET levert de huidige status +
 * revisie; POST voert een actie uit (start/stop/pauze/workout) op de server.
 * Zo volgen gsm en laptop/tv dezelfde routine en stuurt de server de muziek aan.
 */
import { serverRoutine } from "@/lib/routine/server-store";
import type { RoutineAction } from "@/lib/routine/transitions";

export async function GET() {
  return Response.json(serverRoutine.get());
}

const VALID = new Set([
  "start",
  "stop",
  "togglePause",
  "skipWorkout",
  "startWorkoutEarly",
  "skipExercise",
]);

export async function POST(request: Request) {
  let body: { action?: string; now?: number };
  try {
    body = (await request.json()) as { action?: string; now?: number };
  } catch {
    return Response.json({ error: "Ongeldige body" }, { status: 400 });
  }
  if (!body.action || !VALID.has(body.action)) {
    return Response.json({ error: "Onbekende actie" }, { status: 400 });
  }
  // `now` komt van de client zodat de klok van het bedienende toestel leidend is.
  const now = typeof body.now === "number" ? body.now : Date.now();
  const result = serverRoutine.dispatch({ type: body.action } as RoutineAction, now);
  return Response.json(result);
}
