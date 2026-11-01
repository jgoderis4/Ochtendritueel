/**
 * Workout-inhoud (briefing §6). Zachte oefeningen die je liggend/zittend IN BED
 * of op de mat kunt doen — geen apparatuur, bedoeld om rustig wakker te worden.
 *
 * Vijf dagvarianten (A–E) die doorlopend rouleren, zodat de routine dagelijks
 * afwisselend blijft (20 unieke oefeningen, geen herhaling binnen de cyclus).
 * Elke oefening heeft een korte loopende demo-animatie.
 */

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

export interface Workout {
  /** Korte dag-aanduiding, bv. "A". */
  type: string;
  title: string;
  focus: string;
  exercises: Exercise[];
}

/**
 * Demo-animaties: anatomische oefen-GIF's uit de open exercise-library (MIT,
 * ExerciseDB), geserveerd via het jsDelivr-CDN. Loopt automatisch.
 */
const GIF = (id: string) =>
  `https://cdn.jsdelivr.net/gh/mohamedatef90/exercise-library@main/gifs/${id}.gif`;

export const WORKOUT_A: Workout = {
  type: "A",
  title: "Dag A · Wakker worden",
  focus: "Zachte mobiliteit — liggend in bed",
  exercises: [
    {
      name: "Enkel- en teenpompen",
      muscleGroup: "Bloedsomloop",
      instructions: "Lig op je rug met gestrekte benen. Pomp je voeten rustig op en neer en krul daarna je tenen in en uit.",
      seconds: 40,
      cues: ["Rustig tempo", "Voel je kuiten"],
      video: GIF("uL9CsKm"),
    },
    {
      name: "Knie-naar-borst",
      muscleGroup: "Onderrug & heupen",
      instructions: "Trek om beurten één knie zacht richting je borst, houd even vast en wissel van been.",
      seconds: 45,
      cues: ["Onderrug ontspannen", "Adem mee"],
      video: GIF("yn0LjwL"),
    },
    {
      name: "Liggende wervelrotatie",
      muscleGroup: "Rug & romp",
      instructions: "Knieën gebogen, voeten op het matras. Laat je knieën samen traag naar links en rechts zakken; schouders blijven liggen.",
      seconds: 45,
      cues: ["Schouders op bed", "Klein beginnen"],
      video: GIF("6sYyrRX"),
    },
    {
      name: "Bruggetje",
      muscleGroup: "Billen & benen",
      instructions: "Voeten plat op het matras, hef je heupen rustig op tot een lichte brug en laat weer zakken.",
      seconds: 40,
      cues: ["Billen aanspannen", "Niet overstrekken"],
      video: GIF("u0cNiij"),
    },
  ],
};

export const WORKOUT_B: Workout = {
  type: "B",
  title: "Dag B · Zachte activatie",
  focus: "Stretch & ademhaling — in bed",
  exercises: [
    {
      name: "Nek- en schouderstretch",
      muscleGroup: "Nek & schouders",
      instructions: "Zit of lig comfortabel. Trek je hoofd zacht naar één schouder tot je rek voelt, en wissel rustig van kant.",
      seconds: 40,
      cues: ["Geen pijn", "Heel traag"],
      video: GIF("x2chWLO"),
    },
    {
      name: "Bekkenkanteling",
      muscleGroup: "Onderrug & buik",
      instructions: "Lig op je rug, knieën gebogen. Kantel je bekken zodat je onderrug het matras raakt, en los weer.",
      seconds: 45,
      cues: ["Buik licht aanspannen", "Kleine beweging"],
      video: GIF("NKJ8o6x"),
    },
    {
      name: "Hamstringstretch",
      muscleGroup: "Achterkant been",
      instructions: "Trek om beurten één been omhoog, handen achter de dij, en houd de stretch zacht vast.",
      seconds: 45,
      cues: ["Knie mag licht gebogen", "Niet forceren"],
      video: GIF("xTjr103"),
    },
    {
      name: "Zijligging beenheffen",
      muscleGroup: "Heup & bil",
      instructions: "Lig op je zij. Til je bovenste been rustig op en neer; wissel halverwege van kant.",
      seconds: 45,
      cues: ["Rustig", "Romp stabiel"],
      video: GIF("7WaDzyL"),
    },
  ],
};

export const WORKOUT_C: Workout = {
  type: "C",
  title: "Dag C · Rug & romp",
  focus: "Kern & onderrug — liggend/zittend",
  exercises: [
    {
      name: "Polscirkels",
      muscleGroup: "Polsen & onderarmen",
      instructions: "Maak rustige cirkels met beide polsen, enkele keren elke kant op — fijn om op te warmen.",
      seconds: 35,
      cues: ["Ontspannen handen", "Beide richtingen"],
      video: GIF("2zNKRUB"),
    },
    {
      name: "Dead bug",
      muscleGroup: "Buikspieren",
      instructions: "Op je rug, armen omhoog en knieën gebogen. Strek om beurten tegengestelde arm en been langzaam uit en terug.",
      seconds: 45,
      cues: ["Onderrug tegen mat", "Rustig tempo"],
      video: GIF("iny3m5y"),
    },
    {
      name: "Wervelkolom-stretch",
      muscleGroup: "Rug & romp",
      instructions: "Zit met gestrekte benen. Reik rustig voorover richting je tenen en rond je rug zacht af.",
      seconds: 45,
      cues: ["Volg je adem", "Niet forceren"],
      video: GIF("JbC2iaV"),
    },
    {
      name: "Zittende onderrug-stretch",
      muscleGroup: "Onderrug",
      instructions: "Zittend, draai je romp zacht opzij en houd even vast; wissel van kant.",
      seconds: 40,
      cues: ["Rechtop zitten", "Zacht draaien"],
      video: GIF("QFmz6ch"),
    },
  ],
};

export const WORKOUT_D: Workout = {
  type: "D",
  title: "Dag D · Heupen & benen",
  focus: "Benen & heupen — op de mat",
  exercises: [
    {
      name: "Beenheffen liggend",
      muscleGroup: "Buik & heupbuigers",
      instructions: "Lig op je rug, benen gestrekt. Hef ze samen rustig een stukje op en laat gecontroleerd weer zakken.",
      seconds: 40,
      cues: ["Onderrug tegen mat", "Gecontroleerd"],
      video: GIF("9IxJdtC"),
    },
    {
      name: "Zijligging been naar binnen",
      muscleGroup: "Binnenbeen",
      instructions: "Lig op je zij. Beweeg je onderste, gestrekte been rustig omhoog en terug; wissel halverwege.",
      seconds: 45,
      cues: ["Kleine beweging", "Rustig"],
      video: GIF("c8f5cSY"),
    },
    {
      name: "Eenbenige brug",
      muscleGroup: "Billen & core",
      instructions: "Eén voet op de mat, ander been gestrekt. Hef je heupen rustig op en laat zakken; wissel van been.",
      seconds: 45,
      cues: ["Heupen recht", "Billen aanspannen"],
      video: GIF("rmEukuS"),
    },
    {
      name: "Zittende kuitstretch",
      muscleGroup: "Kuiten",
      instructions: "Zit met gestrekt been, trek je tenen zacht naar je toe tot je rek in de kuit voelt.",
      seconds: 40,
      cues: ["Zacht trekken", "Beide benen"],
      video: GIF("17bqEXD"),
    },
  ],
};

export const WORKOUT_E: Workout = {
  type: "E",
  title: "Dag E · Open & strekken",
  focus: "Borst, heup & ontspanning",
  exercises: [
    {
      name: "Borststretch achter het hoofd",
      muscleGroup: "Borst & schouders",
      instructions: "Breng je handen achter je hoofd en open je ellebogen rustig naar achter tot je je borst voelt rekken.",
      seconds: 40,
      cues: ["Borst open", "Schouders laag"],
      video: GIF("QoHIhPl"),
    },
    {
      name: "Borst- en schouderstretch",
      muscleGroup: "Borst & schouders",
      instructions: "Strek één arm opzij en draai je romp zacht weg tot je rek voelt; wissel van kant.",
      seconds: 40,
      cues: ["Rustig draaien", "Geen pijn"],
      video: GIF("Uto7l43"),
    },
    {
      name: "Zittende piriformis-stretch",
      muscleGroup: "Heup & bil",
      instructions: "Leg zittend één enkel over de andere knie en leun zacht voorover tot je rek in de bil voelt.",
      seconds: 45,
      cues: ["Rug recht", "Zacht leunen"],
      video: GIF("QY39eBr"),
    },
    {
      name: "Zijligging quad-stretch",
      muscleGroup: "Voorkant dij",
      instructions: "Lig op je zij, pak je bovenste enkel en trek je hiel zacht richting je bil; wissel van kant.",
      seconds: 45,
      cues: ["Knieën samen", "Niet forceren"],
      video: GIF("BWnJR72"),
    },
  ],
};

/** Alle dagvarianten in rotatievolgorde. */
export const WORKOUTS: Workout[] = [WORKOUT_A, WORKOUT_B, WORKOUT_C, WORKOUT_D, WORKOUT_E];

/** Doorlopende afwisseling op basis van een dagindex (roulatie over alle dagen). */
export function workoutForDayIndex(dayIndex: number): Workout {
  const i = ((dayIndex % WORKOUTS.length) + WORKOUTS.length) % WORKOUTS.length;
  return WORKOUTS[i];
}
