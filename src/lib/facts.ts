/**
 * "Weetje van de dag" — een gecureerde pool korte, waargebeurde weetjes (NL).
 * Elke dag worden er deterministisch 3 gekozen (zelfde op tv/app/alle toestellen),
 * die dagelijks rouleren zodat je telkens iets nieuws leest.
 */

export const FACTS: string[] = [
  "Honing bederft nooit: in Egyptische graven is nog eetbare honing van duizenden jaren oud gevonden.",
  "Octopussen hebben drie harten en blauw bloed.",
  "Bananen zijn botanisch gezien bessen, aardbeien niet.",
  "Een bliksemschicht is ongeveer vijf keer heter dan het oppervlak van de zon.",
  "Zonlicht doet er zo'n 8 minuten over om de aarde te bereiken.",
  "Een dag op Venus duurt langer dan een heel jaar op Venus.",
  "Haaien bestaan al langer dan bomen.",
  "De Eiffeltoren wordt in de zomer zo'n 15 cm hoger doordat het metaal uitzet.",
  "Een groep flamingo's heet een 'flamboyance'.",
  "Kolibries zijn de enige vogels die echt achteruit kunnen vliegen.",
  "Het menselijk lichaam telt meer dan 600 spieren.",
  "De kortste oorlog ooit duurde ongeveer 38 minuten (1896, Zanzibar).",
  "Een slak kan er maanden over doen om één enkele nacht van ons te 'slapen' — sommige soorten slapen jaren bij droogte.",
  "Wombats produceren kubusvormige keutels.",
  "De Noordzee is gemiddeld maar zo'n 95 meter diep.",
  "Je hartspier pompt per dag genoeg bloed om een klein zwembad te vullen.",
  "Mieren hebben geen longen; ze ademen via kleine openingen in hun lichaam.",
  "Er zijn meer sterren in het heelal dan zandkorrels op alle stranden van de aarde.",
  "Een bijenkolonie kan in de winter de temperatuur in de korf rond de 35 °C houden.",
  "De punt van de Mount Everest bestaat uit kalksteen van een oude zeebodem.",
  "Water bereikt zijn grootste dichtheid bij 4 °C, daarom drijft ijs.",
  "Een kat kan geen zoet proeven.",
  "De tong van een blauwe vinvis weegt ongeveer evenveel als een olifant.",
  "Pluto is kleiner dan de Verenigde Staten in breedte.",
  "Een gewone potlood kan een lijn van zo'n 56 km trekken.",
  "Gouden vissen kunnen kleuren onderscheiden, inclusief ultraviolet.",
  "De Sahara was duizenden jaren geleden een groen landschap met meren.",
  "Een dag op aarde wordt heel langzaam langer: de maan duwt ons tempo af.",
  "Spinrag is, gewicht voor gewicht, sterker dan staal.",
  "Het menselijk oog kan ongeveer 10 miljoen kleuren onderscheiden.",
  "Komodovaranen kunnen zich voortplanten zonder mannetje (maagdelijke voortplanting).",
  "De meeste kaarten tonen het noorden boven — puur afspraak, niet natuurwet.",
  "Een wolk kan makkelijk honderden tonnen water wegen.",
  "IJsberen hebben zwarte huid onder hun doorschijnende vacht.",
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** De 3 weetjes van vandaag (deterministisch, rouleren dagelijks). */
export function factsForDay(now: number = Date.now()): string[] {
  const day = Math.floor(now / 86_400_000);
  const len = FACTS.length;
  const start = mod(day * 3, len);
  const step = 7; // coprime met de poolgrootte → drie verschillende weetjes
  return [0, 1, 2].map((i) => FACTS[mod(start + i * step, len)]);
}
