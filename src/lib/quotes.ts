/**
 * "Citaat van de dag" — een gecureerde pool korte, motiverende/wijze citaten (NL),
 * met auteur. Elke dag wordt er deterministisch één gekozen (zelfde op tv/app/alle
 * toestellen), die dagelijks rouleert zodat je telkens iets nieuws leest.
 * Vervangt de oude Porsche-tegel op het dashboard.
 */

export type Quote = { text: string; author: string };

export const QUOTES: Quote[] = [
  { text: "De beste tijd om een boom te planten was twintig jaar geleden. De op één na beste tijd is nu.", author: "Chinees spreekwoord" },
  { text: "Het geheim om vooruit te komen is beginnen.", author: "Mark Twain" },
  { text: "Geluk is niet iets kant-en-klaars. Het komt voort uit je eigen daden.", author: "Dalai Lama" },
  { text: "Het leven is wat er gebeurt terwijl je andere plannen maakt.", author: "John Lennon" },
  { text: "Wat je vandaag doet, kan al je morgens verbeteren.", author: "Ralph Marston" },
  { text: "Val zeven keer, sta acht keer op.", author: "Japans spreekwoord" },
  { text: "Je mist 100% van de kansen die je niet waagt.", author: "Wayne Gretzky" },
  { text: "Een reis van duizend mijl begint met één stap.", author: "Lao Tse" },
  { text: "Doe wat je kunt, met wat je hebt, waar je bent.", author: "Theodore Roosevelt" },
  { text: "Het verleden kun je niet veranderen, maar je toekomst wel vormgeven.", author: "Onbekend" },
  { text: "Geloof dat je het kunt en je bent al halverwege.", author: "Theodore Roosevelt" },
  { text: "De grootste glorie ligt niet in nooit vallen, maar in telkens weer opstaan.", author: "Nelson Mandela" },
  { text: "Kwaliteit is geen daad, het is een gewoonte.", author: "Aristoteles" },
  { text: "Wie goed doet, goed ontmoet.", author: "Nederlands spreekwoord" },
  { text: "Niet de jaren in je leven tellen, maar het leven in je jaren.", author: "Abraham Lincoln" },
  { text: "Verander je gedachten en je verandert je wereld.", author: "Norman Vincent Peale" },
  { text: "Succes is de som van kleine inspanningen, dag na dag herhaald.", author: "Robert Collier" },
  { text: "Wie wacht op het perfecte moment, wacht voor altijd.", author: "Onbekend" },
  { text: "Elke ochtend is een nieuwe kans om het anders te doen.", author: "Onbekend" },
  { text: "Rust is geen luiheid; soms is stilzitten het beste werk.", author: "John Lubbock" },
  { text: "Begin waar je bent. Gebruik wat je hebt. Doe wat je kunt.", author: "Arthur Ashe" },
  { text: "Een glimlach is de kortste afstand tussen twee mensen.", author: "Victor Borge" },
  { text: "Dromen worden werkelijkheid als we de moed hebben ze na te jagen.", author: "Walt Disney" },
  { text: "Hoe je je dag begint, bepaalt vaak hoe je dag verloopt.", author: "Onbekend" },
  { text: "Geduld is bitter, maar zijn vrucht is zoet.", author: "Aristoteles" },
  { text: "Vergelijk jezelf met wie je gisteren was, niet met iemand anders vandaag.", author: "Jordan Peterson" },
  { text: "Het is niet de berg die we bedwingen, maar onszelf.", author: "Edmund Hillary" },
  { text: "Kleine stappen elke dag leiden tot grote veranderingen.", author: "Onbekend" },
  { text: "Wie niet elke dag een beetje leert, wordt elke dag een beetje dommer.", author: "Onbekend" },
  { text: "Moed is niet de afwezigheid van angst, maar het overwinnen ervan.", author: "Nelson Mandela" },
  { text: "Het leven draait niet om wachten tot de storm overwaait, maar om leren dansen in de regen.", author: "Vivian Greene" },
  { text: "Tevredenheid is de grootste rijkdom.", author: "Lao Tse" },
  { text: "Doe vandaag iets waar je toekomstige zelf je dankbaar voor is.", author: "Onbekend" },
  { text: "Een goed begin is het halve werk.", author: "Aristoteles" },
  { text: "Energie en doorzettingsvermogen overwinnen alles.", author: "Benjamin Franklin" },
  { text: "Wie goed luistert, leert dubbel zoveel.", author: "Onbekend" },
  { text: "De enige onmogelijke reis is die je nooit begint.", author: "Tony Robbins" },
  { text: "Wees de verandering die je in de wereld wilt zien.", author: "Mahatma Gandhi" },
  { text: "Geniet van de kleine dingen, want op een dag kijk je terug en besef je dat het de grote dingen waren.", author: "Robert Brault" },
  { text: "Vandaag is de eerste dag van de rest van je leven.", author: "Onbekend" },
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Het citaat van vandaag (deterministisch, roteert dagelijks door de hele pool).
 * Stap 7 is coprime met de meeste poolgroottes → goede spreiding over de dagen.
 */
export function quoteForDay(now: number = Date.now()): Quote {
  const day = Math.floor(now / 86_400_000);
  return QUOTES[mod(day * 7, QUOTES.length)];
}
