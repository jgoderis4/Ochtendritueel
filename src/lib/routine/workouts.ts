/**
 * Workout-inhoud (briefing §6). Twee types die doorlopend afwisselen (A/B),
 * ook over weekgrenzen heen. Zachte oefeningen die je liggend/zittend IN BED
 * kunt doen — geen apparatuur, bedoeld om rustig wakker te worden. Geen
 * workoutgeschiedenis/log. Stilstaand beeld (placeholder in Fase 1).
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
  title: "Workout A · Wakker worden",
  focus: "Zachte mobiliteit — liggend in bed",
  exercises: [
    {
      name: "Enkel- en teenpompen",
      muscleGroup: "Bloedsomloop",
      instructions: "Lig op je rug met gestrekte benen. Pomp je voeten rustig op en neer en krul daarna je tenen in en uit.",
      seconds: 40,
      cues: ["Rustig tempo", "Voel je kuiten"],
    },
    {
      name: "Knie-naar-borst",
      muscleGroup: "Onderrug & heupen",
      instructions: "Trek om beurten één knie zacht richting je borst, houd even vast en wissel van been.",
      seconds: 45,
      cues: ["Onderrug ontspannen", "Adem mee"],
    },
    {
      name: "Liggende wervelrotatie",
      muscleGroup: "Rug & romp",
      instructions: "Knieën gebogen, voeten op het matras. Laat je knieën samen traag naar links en rechts zakken; schouders blijven liggen.",
      seconds: 45,
      cues: ["Schouders op bed", "Klein beginnen"],
    },
    {
      name: "Bruggetje",
      muscleGroup: "Billen & benen",
      instructions: "Voeten plat op het matras, hef je heupen rustig op tot een lichte brug en laat weer zakken.",
      seconds: 40,
      cues: ["Billen aanspannen", "Niet overstrekken"],
    },
  ],
};

export const WORKOUT_B: Workout = {
  type: "B",
  title: "Workout B · Zachte activatie",
  focus: "Stretch & ademhaling — in bed",
  exercises: [
    {
      name: "Nek- en schouderrollen",
      muscleGroup: "Nek & schouders",
      instructions: "Zit of lig comfortabel. Rol je schouders traag achterwaarts en draai je nek zacht van links naar rechts.",
      seconds: 40,
      cues: ["Geen pijn", "Heel traag"],
    },
    {
      name: "Bekkenkanteling",
      muscleGroup: "Onderrug & buik",
      instructions: "Lig op je rug, knieën gebogen. Kantel je bekken zodat je onderrug het matras raakt, en los weer.",
      seconds: 45,
      cues: ["Buik licht aanspannen", "Kleine beweging"],
    },
    {
      name: "Hamstringstretch",
      muscleGroup: "Achterkant been",
      instructions: "Trek om beurten één been omhoog, handen achter de dij, en houd de stretch zacht vast.",
      seconds: 45,
      cues: ["Knie mag licht gebogen", "Niet forceren"],
    },
    {
      name: "Zijligging beenheffen",
      muscleGroup: "Heup & bil",
      instructions: "Lig op je zij. Til je bovenste been rustig op en neer; wissel halverwege van kant.",
      seconds: 45,
      cues: ["Rustig", "Romp stabiel"],
    },
  ],
};

/** Doorlopende A/B-afwisseling op basis van een dagindex (0 = A, 1 = B, ...). */
export function workoutForDayIndex(dayIndex: number): Workout {
  return dayIndex % 2 === 0 ? WORKOUT_A : WORKOUT_B;
}
