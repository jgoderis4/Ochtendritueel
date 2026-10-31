/**
 * Routine-kern — de vaste 30-minuten tijdlijn (D-006).
 * Pure logica, geen UI/IO. Zowel /tv als /app leiden hun staat hiervan af,
 * zodat tv en telefoon synchroon lopen (D-002).
 *
 * Tijdlijn (tijd vanaf start):
 *   00:00–01:00  welkomstscherm
 *   01:00–10:00  vast dashboard
 *   10:00        workout start automatisch (tenzij overgeslagen/eerder gestart)
 *   workout 7 min (doelduur), muziek blijft spelen
 *   na workout   dashboard tot
 *   30:00        einde (muziek stopt, tv uit indien ondersteund)
 */

export type RoutinePhase = "welcome" | "dashboard" | "workout" | "ended";

export const MINUTE = 60_000;

/** Doelduur van de workout (D-006: 5–10 min; we kiezen 7 min). */
export const WORKOUT_DURATION = 7 * MINUTE;

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
  /** Totaal opgebouwde (afgesloten) pauzeduur in ms. */
  pausedMs: number;
  /** Epoch ms waarop de huidige pauze begon, of null. Zo is de live pauze
   *  afleidbaar uit de staat zelf — deelbaar tussen tabs/vensters. */
  pausedAt: number | null;
  /** Gebruiker heeft de workout overgeslagen. */
  workoutSkipped: boolean;
  /** Verstreken routinetijd (ms) waarop de workout handmatig vroeger is
   *  gestart, of null wanneer de automatische start (@10 min) geldt. */
  workoutStartOffsetMs: number | null;
  /** Opgetelde "oefening overslaan"-tijd (ms): schuift de workout-voortgang
   *  vooruit zonder het einde van de workout te verzetten. */
  workoutSkipMs: number;
}

export const INITIAL_STATE: RoutineState = {
  startedAt: null,
  paused: false,
  pausedMs: 0,
  pausedAt: null,
  workoutSkipped: false,
  workoutStartOffsetMs: null,
  workoutSkipMs: 0,
};

/** Verstreken routinetijd in ms (pauze niet meegerekend, ook de lopende pauze). */
export function elapsedMs(state: RoutineState, now: number): number {
  if (state.startedAt === null) return 0;
  let raw = now - state.startedAt - state.pausedMs;
  if (state.paused && state.pausedAt != null) raw -= Math.max(0, now - state.pausedAt);
  return Math.max(0, raw);
}

/** Resterende tijd tot automatisch einde (ms). */
export function remainingMs(state: RoutineState, now: number): number {
  return Math.max(0, TIMELINE.hardEnd - elapsedMs(state, now));
}

/**
 * Verstreken-routinetijd (offset) waarop de workout begint, of null wanneer
 * er geen workout komt (overgeslagen). Handmatige vroege start wint van de
 * automatische start @10 min.
 */
export function workoutStartOffset(state: RoutineState): number | null {
  if (state.workoutSkipped) return null;
  if (state.workoutStartOffsetMs !== null) return state.workoutStartOffsetMs;
  return TIMELINE.workoutAutoStart;
}

/** Verstreken tijd binnen de workout (0..WORKOUT_DURATION); 0 vóór/na de workout. */
export function workoutElapsedMs(state: RoutineState, now: number): number {
  const offset = workoutStartOffset(state);
  if (offset === null) return 0;
  // Overgeslagen oefeningen schuiven de voortgang vooruit (skip-tijd meetellen).
  const since = elapsedMs(state, now) - offset + (state.workoutSkipMs ?? 0);
  return Math.min(WORKOUT_DURATION, Math.max(0, since));
}

/** Bepaalt de huidige fase op basis van de staat en de klok. */
export function currentPhase(state: RoutineState, now: number): RoutinePhase {
  if (state.startedAt === null) return "ended";

  const elapsed = elapsedMs(state, now);
  if (elapsed >= TIMELINE.hardEnd) return "ended";

  // Workout-venster vóór de welkom-check, zodat een handmatige vroege start
  // ook tijdens de welkomstminuut de workout toont. De workout eindigt na de
  // doelduur en keert daarna terug naar het dashboard.
  const offset = workoutStartOffset(state);
  if (offset !== null && elapsed >= offset && elapsed < offset + WORKOUT_DURATION) {
    return "workout";
  }

  if (elapsed < TIMELINE.welcomeEnd) return "welcome";
  return "dashboard";
}

/** mm:ss weergave van een ms-duur (voor countdowns). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
