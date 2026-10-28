/**
 * Routine-kern — de vaste 30-minuten tijdlijn (D-006).
 * Pure logica, geen UI/IO. Zowel /tv als /app leiden hun staat hiervan af,
 * zodat tv en telefoon synchroon lopen (D-002).
 *
 * Tijdlijn (tijd vanaf start):
 *   00:00–01:00  welkomstscherm
 *   01:00–10:00  vast dashboard
 *   10:00        workout start automatisch (tenzij overgeslagen/eerder gestart)
 *   workout 5–10 min, muziek blijft spelen
 *   na workout   dashboard tot
 *   30:00        einde (muziek stopt, tv uit indien ondersteund)
 */

export type RoutinePhase = "welcome" | "dashboard" | "workout" | "ended";

export const MINUTE = 60_000;

/** Vaste ankerpunten in de tijdlijn. */
export const TIMELINE = {
  welcomeEnd: 1 * MINUTE,
  workoutAutoStart: 10 * MINUTE,
  hardEnd: 30 * MINUTE,
} as const;

export interface RoutineState {
  /** Starttijdstip (epoch ms) of null wanneer de routine niet loopt. */
  startedAt: number | null;
  /** Gepauzeerd: tijd staat stil. */
  paused: boolean;
  /** Totaal opgebouwde pauzeduur (ms), zodat de klok niet doorloopt tijdens pauze. */
  pausedMs: number;
  /** Gebruiker heeft de workout overgeslagen. */
  workoutSkipped: boolean;
  /** Tijdstip waarop de workout handmatig vroeger is gestart (epoch ms) of null. */
  workoutStartedAt: number | null;
}

export const INITIAL_STATE: RoutineState = {
  startedAt: null,
  paused: false,
  pausedMs: 0,
  workoutSkipped: false,
  workoutStartedAt: null,
};

/** Verstreken routinetijd in ms (pauze niet meegerekend). */
export function elapsedMs(state: RoutineState, now: number): number {
  if (state.startedAt === null) return 0;
  return Math.max(0, now - state.startedAt - state.pausedMs);
}

/** Resterende tijd tot automatisch einde (ms). */
export function remainingMs(state: RoutineState, now: number): number {
  return Math.max(0, TIMELINE.hardEnd - elapsedMs(state, now));
}

/** Is de workout (automatisch of handmatig) begonnen? */
function workoutHasStarted(state: RoutineState, elapsed: number): boolean {
  if (state.workoutSkipped) return false;
  if (state.workoutStartedAt !== null) return true;
  return elapsed >= TIMELINE.workoutAutoStart;
}

/** Bepaalt de huidige fase op basis van de staat en de klok. */
export function currentPhase(state: RoutineState, now: number): RoutinePhase {
  if (state.startedAt === null) return "ended";

  const elapsed = elapsedMs(state, now);
  if (elapsed >= TIMELINE.hardEnd) return "ended";
  if (elapsed < TIMELINE.welcomeEnd) return "welcome";

  if (workoutHasStarted(state, elapsed)) {
    // Workout loopt tot de doelduur voorbij is; daarna terug naar dashboard.
    // De exacte workout-duur (5–10 min) wordt door de workout-engine bepaald;
    // hier geldt: zodra de workout actief is, blijft 'workout' tot die engine
    // aangeeft dat hij klaar is. Voor de tijdlijn volstaat deze afleiding in v1.
    return "workout";
  }

  return "dashboard";
}

/** mm:ss weergave van een ms-duur (voor countdowns). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
