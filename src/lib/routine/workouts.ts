/**
 * Workout-inhoud (briefing §6). Zachte oefeningen die je liggend/zittend IN BED
 * of op de mat kunt doen — geen apparatuur, bedoeld om rustig wakker te worden.
 *
 * In plaats van een vaste A/B-lijst kiezen we elke dag DETERMINISTISCH een andere
 * combinatie uit een grote pool, zodat de routine dagelijks anders aanvoelt
 * (ongeveer een maand lang zonder herhaalde dagcombinatie). Deterministisch =
 * zelfde keuze op /tv en /app en op elk toestel.
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
  /** Korte dag-aanduiding (indexnummer binnen de rotatie). */
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

const S = 40; // standaard oefenduur (s)

/** Pool van zachte bed-/matoefeningen (met geverifieerde demo-animaties). */
const POOL: Exercise[] = [
  { name: "Enkel- en teenpompen", muscleGroup: "Bloedsomloop", seconds: S,
    instructions: "Lig op je rug met gestrekte benen. Pomp je voeten rustig op en neer en krul daarna je tenen in en uit.",
    cues: ["Rustig tempo", "Voel je kuiten"], video: GIF("uL9CsKm") },
  { name: "Polscirkels", muscleGroup: "Polsen & onderarmen", seconds: 35,
    instructions: "Maak rustige cirkels met beide polsen, enkele keren elke kant op — fijn om op te warmen.",
    cues: ["Ontspannen handen", "Beide richtingen"], video: GIF("2zNKRUB") },
  { name: "Knie-naar-borst", muscleGroup: "Onderrug & heupen", seconds: 45,
    instructions: "Trek om beurten één knie zacht richting je borst, houd even vast en wissel van been.",
    cues: ["Onderrug ontspannen", "Adem mee"], video: GIF("yn0LjwL") },
  { name: "Bekkenkanteling", muscleGroup: "Onderrug & buik", seconds: 45,
    instructions: "Lig op je rug, knieën gebogen. Kantel je bekken zodat je onderrug het matras raakt, en los weer.",
    cues: ["Buik licht aanspannen", "Kleine beweging"], video: GIF("NKJ8o6x") },
  { name: "Bekkenkanteling tot brug", muscleGroup: "Onderrug & billen", seconds: 45,
    instructions: "Rol vanuit de bekkenkanteling je ruggengraat rustig op tot een lichte brug en weer traag terug.",
    cues: ["Wervel voor wervel", "Rustig"], video: GIF("D9qe7CM") },
  { name: "Bruggetje", muscleGroup: "Billen & benen", seconds: S,
    instructions: "Voeten plat op het matras, hef je heupen rustig op tot een lichte brug en laat weer zakken.",
    cues: ["Billen aanspannen", "Niet overstrekken"], video: GIF("u0cNiij") },
  { name: "Eenbenige brug", muscleGroup: "Billen & core", seconds: 45,
    instructions: "Eén voet op de mat, ander been gestrekt. Hef je heupen rustig op en laat zakken; wissel van been.",
    cues: ["Heupen recht", "Billen aanspannen"], video: GIF("rmEukuS") },
  { name: "Liggende wervelrotatie", muscleGroup: "Rug & romp", seconds: 45,
    instructions: "Knieën gebogen, voeten op het matras. Laat je knieën samen traag naar links en rechts zakken; schouders blijven liggen.",
    cues: ["Schouders op bed", "Klein beginnen"], video: GIF("6sYyrRX") },
  { name: "Draaiende heuplift", muscleGroup: "Heup & romp", seconds: 40,
    instructions: "Op je rug, knieën gebogen. Laat je knieën zacht naar één kant draaien en til je heup licht; wissel van kant.",
    cues: ["Rustig draaien", "Schouders laag"], video: GIF("AX1kB0o") },
  { name: "Dead bug", muscleGroup: "Buikspieren", seconds: 45,
    instructions: "Op je rug, armen omhoog en knieën gebogen. Strek om beurten tegengestelde arm en been langzaam uit en terug.",
    cues: ["Onderrug tegen mat", "Rustig tempo"], video: GIF("iny3m5y") },
  { name: "Beenheffen liggend", muscleGroup: "Buik & heupbuigers", seconds: 40,
    instructions: "Lig op je rug, benen gestrekt. Hef ze samen rustig een stukje op en laat gecontroleerd weer zakken.",
    cues: ["Onderrug tegen mat", "Gecontroleerd"], video: GIF("9IxJdtC") },
  { name: "Zijligging beenheffen", muscleGroup: "Heup & bil", seconds: 45,
    instructions: "Lig op je zij. Til je bovenste been rustig op en neer; wissel halverwege van kant.",
    cues: ["Rustig", "Romp stabiel"], video: GIF("7WaDzyL") },
  { name: "Zijligging been naar binnen", muscleGroup: "Binnenbeen", seconds: 45,
    instructions: "Lig op je zij. Beweeg je onderste, gestrekte been rustig omhoog en terug; wissel halverwege.",
    cues: ["Kleine beweging", "Rustig"], video: GIF("c8f5cSY") },
  { name: "Gestrekt been heup-abductie", muscleGroup: "Heup & bil", seconds: 45,
    instructions: "Lig op je zij met gestrekt bovenste been. Breng het rustig omhoog en terug; wissel van kant.",
    cues: ["Teen naar voren", "Gecontroleerd"], video: GIF("mQ1tBXn") },
  { name: "Zijligging quad-stretch", muscleGroup: "Voorkant dij", seconds: 45,
    instructions: "Lig op je zij, pak je bovenste enkel en trek je hiel zacht richting je bil; wissel van kant.",
    cues: ["Knieën samen", "Niet forceren"], video: GIF("BWnJR72") },
  { name: "Zijligging rugstretch", muscleGroup: "Rug", seconds: 40,
    instructions: "Lig op je zij en strek je bovenste arm rustig open naar achter tot je je rug en borst voelt rekken.",
    cues: ["Volg je adem", "Zacht openen"], video: GIF("jDOKRM5") },
  { name: "Wervelkolom-stretch", muscleGroup: "Rug & romp", seconds: 45,
    instructions: "Zit met gestrekte benen. Reik rustig voorover richting je tenen en rond je rug zacht af.",
    cues: ["Volg je adem", "Niet forceren"], video: GIF("JbC2iaV") },
  { name: "Zittende rompdraai", muscleGroup: "Rug & romp", seconds: 40,
    instructions: "Zit rechtop, armen voor de borst. Draai je bovenlichaam rustig naar links en rechts.",
    cues: ["Rechtop zitten", "Heupen stil"], video: GIF("2jl9K55") },
  { name: "Zittende onderrug-draai", muscleGroup: "Onderrug", seconds: 40,
    instructions: "Zittend, draai je romp zacht opzij en houd even vast; wissel van kant.",
    cues: ["Rechtop zitten", "Zacht draaien"], video: GIF("QFmz6ch") },
  { name: "Zittende bil-stretch", muscleGroup: "Billen", seconds: 45,
    instructions: "Zit en leg één enkel over de andere knie. Leun zacht voorover tot je rek in de bil voelt; wissel.",
    cues: ["Rug recht", "Zacht leunen"], video: GIF("DeDThfG") },
  { name: "Zittende piriformis-stretch", muscleGroup: "Heup & bil", seconds: 45,
    instructions: "Leg zittend één enkel over de andere knie en leun zacht voorover tot je rek in de heup voelt.",
    cues: ["Rug recht", "Zacht leunen"], video: GIF("QY39eBr") },
  { name: "Zittende wijd-hoek stretch", muscleGroup: "Benen & heupen", seconds: 45,
    instructions: "Zit met je benen in een brede V. Reik rustig voorover vanuit je heupen.",
    cues: ["Rug lang", "Niet forceren"], video: GIF("HIgYKAB") },
  { name: "Zittend beenheffen", muscleGroup: "Buik & benen", seconds: 40,
    instructions: "Zit rechtop, handen naast je. Strek om beurten één been en hef het licht; wissel van been.",
    cues: ["Rechtop zitten", "Rustig"], video: GIF("Hgs6Nl1") },
  { name: "Hamstringstretch", muscleGroup: "Achterkant been", seconds: 45,
    instructions: "Trek om beurten één been omhoog, handen achter de dij, en houd de stretch zacht vast.",
    cues: ["Knie mag licht gebogen", "Niet forceren"], video: GIF("xTjr103") },
  { name: "Zittende kuitstretch", muscleGroup: "Kuiten", seconds: 40,
    instructions: "Zit met gestrekt been, trek je tenen zacht naar je toe tot je rek in de kuit voelt.",
    cues: ["Zacht trekken", "Beide benen"], video: GIF("17bqEXD") },
  { name: "Kuitstretch tegen de muur", muscleGroup: "Kuiten", seconds: 40,
    instructions: "Plaats je handen tegen de muur, één been naar achter gestrekt, hiel op de grond tot je rek voelt.",
    cues: ["Hiel omlaag", "Wissel van been"], video: GIF("m0tCHqc") },
  { name: "Vierpunts quad-stretch", muscleGroup: "Voorkant dij", seconds: 40,
    instructions: "Op handen en knieën, schuif je zit rustig naar je hielen en weer naar voor.",
    cues: ["Rustig wiegen", "Rug neutraal"], video: GIF("qBcKorM") },
  { name: "Nek- en schouderstretch", muscleGroup: "Nek & schouders", seconds: 40,
    instructions: "Trek je hoofd zacht naar één schouder tot je rek voelt, en wissel rustig van kant.",
    cues: ["Geen pijn", "Heel traag"], video: GIF("x2chWLO") },
  { name: "Nek zijstretch", muscleGroup: "Nek", seconds: 35,
    instructions: "Leg één hand zacht tegen de zijkant van je hoofd en geef lichte weerstand; wissel van kant.",
    cues: ["Lichte druk", "Rustig ademen"], video: GIF("oQRJYkC") },
  { name: "Borststretch achter het hoofd", muscleGroup: "Borst & schouders", seconds: 40,
    instructions: "Breng je handen achter je hoofd en open je ellebogen rustig naar achter tot je je borst voelt rekken.",
    cues: ["Borst open", "Schouders laag"], video: GIF("QoHIhPl") },
  { name: "Borst- en schouderdraai", muscleGroup: "Borst & schouders", seconds: 40,
    instructions: "Strek één arm opzij en draai je romp zacht weg tot je rek voelt; wissel van kant.",
    cues: ["Rustig draaien", "Geen pijn"], video: GIF("Uto7l43") },
  { name: "Dynamische borststretch", muscleGroup: "Borst", seconds: 35,
    instructions: "Open en sluit je armen rustig voor je borst, met een zachte zwaai, om borst en schouders los te maken.",
    cues: ["Vloeiend", "Niet forceren"], video: GIF("3uj0Ozg") },
];

/** Thema-titels die per dag rouleren (alleen voor de sfeer/het kopje). */
const THEMES = [
  "Wakker worden",
  "Zachte activatie",
  "Rug & romp",
  "Heupen & benen",
  "Open & strekken",
  "Mobiliteit",
  "Rust & rek",
];

const PER_DAY = 4; // aantal oefeningen per dag
const STEP = 11; // onderlinge sprong in de pool (coprime met 31 → geen duplicaten)

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Bouwt de workout van de dag: kiest deterministisch PER_DAY oefeningen uit de
 * pool op basis van de dagindex. De startpositie schuift elke dag op, zodat
 * opeenvolgende dagen een andere combinatie krijgen.
 */
export function workoutForDayIndex(dayIndex: number): Workout {
  const len = POOL.length;
  const start = mod(dayIndex * 7, len);
  const exercises: Exercise[] = [];
  for (let i = 0; i < PER_DAY; i++) {
    exercises.push(POOL[mod(start + i * STEP, len)]);
  }
  const theme = THEMES[mod(dayIndex, THEMES.length)];
  return {
    type: String(mod(dayIndex, len)),
    title: `Ochtendroutine · ${theme}`,
    focus: "Zachte oefeningen om rustig wakker te worden",
    exercises,
  };
}
