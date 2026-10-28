/**
 * Workout-inhoud (briefing §6). Twee types die doorlopend afwisselen (A/B),
 * ook over weekgrenzen heen. Geen apparatuur, weinig ruimte, gemiddeld niveau.
 * Geen workoutgeschiedenis/log. Stilstaand beeld (placeholder in Fase 1).
 */

export type WorkoutType = "A" | "B";

export interface Exercise {
  name: string;
  nameEn?: string;
  muscleGroup: string;
  instructions: string;
  seconds: number;
  cues: string[];
}

export interface Workout {
  type: WorkoutType;
  title: string;
  focus: string;
  exercises: Exercise[];
}

export const WORKOUT_A: Workout = {
  type: "A",
  title: "Workout A · Kracht",
  focus: "Bovenlichaam & buikspieren",
  exercises: [
    {
      name: "Wall Push-ups",
      muscleGroup: "Borst & schouders",
      instructions: "Handen op schouderbreedte tegen de muur, lichaam recht, rustig buigen en strekken.",
      seconds: 45,
      cues: ["Rug recht", "Ellebogen 45°"],
    },
    {
      name: "Aangepaste Push-ups",
      nameEn: "Modified Push-ups",
      muscleGroup: "Borst & core",
      instructions: "Handen op schouderbreedte, knieën op de mat. Houd de buikspieren aangespannen en laat de borst rustig zakken.",
      seconds: 45,
      cues: ["Rug recht", "Ellebogen 45°"],
    },
    {
      name: "Plank",
      muscleGroup: "Core",
      instructions: "Onderarmen en tenen op de mat, lichaam in één rechte lijn, buik aangespannen.",
      seconds: 40,
      cues: ["Heupen laag", "Niet doorzakken"],
    },
    {
      name: "Dead Bug",
      muscleGroup: "Buikspieren",
      instructions: "Op de rug, armen omhoog, tegengestelde arm en been langzaam strekken en terug.",
      seconds: 45,
      cues: ["Onderrug tegen mat", "Rustig tempo"],
    },
  ],
};

export const WORKOUT_B: Workout = {
  type: "B",
  title: "Workout B · Mobiliteit",
  focus: "Schouders, bovenrug, romp & lichte stabiliteit",
  exercises: [
    {
      name: "Schoudercirkels",
      muscleGroup: "Schouders",
      instructions: "Sta rechtop, maak grote, rustige cirkels met beide armen, voor- en achterwaarts.",
      seconds: 40,
      cues: ["Ontspannen nek", "Grote beweging"],
    },
    {
      name: "Cat-Cow",
      muscleGroup: "Bovenrug & romp",
      instructions: "Op handen en knieën, wissel rustig tussen holle en bolle rug op je ademhaling.",
      seconds: 45,
      cues: ["Volg je adem", "Hele wervelkolom"],
    },
    {
      name: "Thoracale rotatie",
      muscleGroup: "Bovenrug",
      instructions: "Op handen en knieën, één hand achter het hoofd, elleboog open- en toedraaien.",
      seconds: 40,
      cues: ["Heupen stil", "Borst openen"],
    },
    {
      name: "Bird Dog",
      muscleGroup: "Stabiliteit",
      instructions: "Op handen en knieën, tegengestelde arm en been strekken, even vasthouden, wisselen.",
      seconds: 45,
      cues: ["Rug neutraal", "Niet kantelen"],
    },
  ],
};

/** Doorlopende A/B-afwisseling op basis van een dagindex (0 = A, 1 = B, ...). */
export function workoutForDayIndex(dayIndex: number): Workout {
  return dayIndex % 2 === 0 ? WORKOUT_A : WORKOUT_B;
}
