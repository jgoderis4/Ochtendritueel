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
  /** Korte, loopende demo-animatie (GIF). Leeg = toon placeholder-icoon. */
  video?: string;
}

/**
 * Demo-animaties: anatomische oefen-GIF's uit de open exercise-library (MIT,
 * ExerciseDB), geserveerd via het jsDelivr-CDN. Loopt automatisch.
 */
const GIF = (id: string) =>
  `https://cdn.jsdelivr.net/gh/mohamedatef90/exercise-library@main/gifs/${id}.gif`;

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
      video: GIF("uL9CsKm"), // ankle circles
    },
    {
      name: "Knie-naar-borst",
      muscleGroup: "Onderrug & heupen",
      instructions: "Trek om beurten één knie zacht richting je borst, houd even vast en wissel van been.",
      seconds: 45,
      cues: ["Onderrug ontspannen", "Adem mee"],
      video: GIF("yn0LjwL"), // lying knee-to-chest (glutes stretch)
    },
    {
      name: "Liggende wervelrotatie",
      muscleGroup: "Rug & romp",
      instructions: "Knieën gebogen, voeten op het matras. Laat je knieën samen traag naar links en rechts zakken; schouders blijven liggen.",
      seconds: 45,
      cues: ["Schouders op bed", "Klein beginnen"],
      video: GIF("6sYyrRX"), // bent knee lying twist
    },
    {
      name: "Bruggetje",
      muscleGroup: "Billen & benen",
      instructions: "Voeten plat op het matras, hef je heupen rustig op tot een lichte brug en laat weer zakken.",
      seconds: 40,
      cues: ["Billen aanspannen", "Niet overstrekken"],
      video: GIF("u0cNiij"), // low glute bridge on floor
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
      video: GIF("x2chWLO"), // neck side stretch
    },
    {
      name: "Bekkenkanteling",
      muscleGroup: "Onderrug & buik",
      instructions: "Lig op je rug, knieën gebogen. Kantel je bekken zodat je onderrug het matras raakt, en los weer.",
      seconds: 45,
      cues: ["Buik licht aanspannen", "Kleine beweging"],
      video: GIF("NKJ8o6x"), // pelvic tilt
    },
    {
      name: "Hamstringstretch",
      muscleGroup: "Achterkant been",
      instructions: "Trek om beurten één been omhoog, handen achter de dij, en houd de stretch zacht vast.",
      seconds: 45,
      cues: ["Knie mag licht gebogen", "Niet forceren"],
      video: GIF("xTjr103"), // hamstring & calf stretch
    },
    {
      name: "Zijligging beenheffen",
      muscleGroup: "Heup & bil",
      instructions: "Lig op je zij. Til je bovenste been rustig op en neer; wissel halverwege van kant.",
      seconds: 45,
      cues: ["Rustig", "Romp stabiel"],
      video: GIF("7WaDzyL"), // side hip abduction
    },
  ],
};

/** Doorlopende A/B-afwisseling op basis van een dagindex (0 = A, 1 = B, ...). */
export function workoutForDayIndex(dayIndex: number): Workout {
  return dayIndex % 2 === 0 ? WORKOUT_A : WORKOUT_B;
}
