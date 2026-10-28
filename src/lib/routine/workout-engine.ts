/**
 * Workout-engine — puur. Leidt uit de verstreken workouttijd af welke oefening
 * nu actief is, welke volgt en hoeveel seconden er in de set resten.
 *
 * De oefeningen van de dag-workout (A/B) hebben samen meestal minder tijd dan de
 * doelduur (WORKOUT_DURATION). We herhalen ze daarom in lus tot de doelduur vol
 * is — zo loopt de set-countdown altijd netjes door tot het einde. Geen `Date`,
 * geen IO: zelfde input → zelfde output (testbaar, SSR-veilig).
 */

import type { Exercise, Workout } from "./workouts";

export interface WorkoutProgress {
  workout: Workout;
  /** Index in de (herhaalde) oefeningenstroom. */
  index: number;
  /** 1-gebaseerd nummer voor weergave ("Oefening 2 van 4"). */
  displayIndex: number;
  /** Aantal unieke oefeningen in de workout. */
  total: number;
  current: Exercise;
  next: Exercise;
  /** Resterende seconden in de huidige oefening (afgerond, >= 0). */
  secondsLeftInExercise: number;
  /** Totale duur van de huidige oefening (s). */
  exerciseSeconds: number;
  /** De workout is afgelopen (doelduur bereikt). */
  done: boolean;
}

/**
 * @param elapsedInWorkoutMs verstreken tijd binnen de workout (0..doelduur)
 */
export function workoutProgress(workout: Workout, elapsedInWorkoutMs: number): WorkoutProgress {
  const exercises = workout.exercises;
  const total = exercises.length;
  const elapsedSec = Math.max(0, elapsedInWorkoutMs / 1000);

  // Loop door de oefeningen (in lus) tot we het tijdstip bereiken.
  let acc = 0;
  let streamIndex = 0;
  // Veiligheidsgrens tegen eindeloze lus bij lege/0-seconden-workout.
  const guard = 10_000;
  while (streamIndex < guard) {
    const ex = exercises[streamIndex % total];
    const dur = Math.max(1, ex.seconds);
    if (elapsedSec < acc + dur) {
      const secondsLeftInExercise = Math.max(0, Math.ceil(acc + dur - elapsedSec));
      const current = ex;
      const next = exercises[(streamIndex + 1) % total];
      return {
        workout,
        index: streamIndex,
        displayIndex: (streamIndex % total) + 1,
        total,
        current,
        next,
        secondsLeftInExercise,
        exerciseSeconds: ex.seconds,
        done: false,
      };
    }
    acc += dur;
    streamIndex += 1;
  }

  // Zou niet voorkomen; val terug op de laatste oefening als "klaar".
  const last = exercises[(total - 1) % total];
  return {
    workout,
    index: total - 1,
    displayIndex: total,
    total,
    current: last,
    next: exercises[0],
    secondsLeftInExercise: 0,
    exerciseSeconds: last.seconds,
    done: true,
  };
}
