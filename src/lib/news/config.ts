/**
 * Nieuwsbronnen via openbare RSS/Atom-feeds (geen login nodig).
 * De Tijd (economie/ondernemen), VRT NWS (Belgisch/regio) en Sporza (sport).
 */
export interface FeedConfig {
  source: string;
  url: string;
  format: "rss" | "atom";
  /** Vast onderwerp als de feed er geen bruikbaar label bij geeft. */
  topic?: string;
  /** Hoeveel items uit deze feed meenemen. */
  max: number;
}

export const NEWS_FEEDS: FeedConfig[] = [
  { source: "VRT NWS", url: "https://www.vrt.be/vrtnws/nl.rss.articles.xml", format: "atom", topic: "België", max: 2 },
  { source: "De Tijd", url: "https://www.tijd.be/rss/nieuws.xml", format: "rss", topic: "Economie", max: 2 },
  { source: "Sporza", url: "https://sporza.be/nl.rss.xml", format: "atom", topic: "Sport", max: 1 },
];
