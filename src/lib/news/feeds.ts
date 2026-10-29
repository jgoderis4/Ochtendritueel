/**
 * Live nieuws uit openbare RSS/Atom-feeds (geen login). Draait server-side; client
 * via /api/news. Bij falen van álle feeds een discrete status (data: null), nooit
 * verzonnen nieuws (D-004 / §9). 15 min gecachet.
 *
 * Lichte eigen parser (geen extra dependency) voor de drie bekende feeds.
 */

import type { NewsItem, Sourced } from "@/lib/adapters/types";
import { NEWS_FEEDS, type FeedConfig } from "./config";

/** Haalt de inhoud van één XML-tag (eerste match), met CDATA-ondersteuning. */
function tagContent(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : null;
}

/** Strip CDATA + HTML-tags, decodeer basis-entities, normaliseer witruimte. */
function clean(raw: string | null): string {
  if (!raw) return "";
  let s = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  s = s.replace(/<[^>]+>/g, " ");
  s = s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
  return s.replace(/\s+/g, " ").trim();
}

function truncate(s: string, max = 160): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

function parseFeed(xml: string, cfg: FeedConfig): NewsItem[] {
  const blockTag = cfg.format === "rss" ? "item" : "entry";
  const blocks = xml.match(new RegExp(`<${blockTag}[^>]*>[\\s\\S]*?</${blockTag}>`, "gi")) ?? [];
  const items: NewsItem[] = [];

  for (const block of blocks) {
    if (items.length >= cfg.max) break;
    const headline = clean(tagContent(block, "title"));
    if (!headline) continue;

    const summaryRaw =
      cfg.format === "rss" ? tagContent(block, "description") : tagContent(block, "summary");
    const topicRaw =
      cfg.format === "rss"
        ? tagContent(block, "category")
        : tagContent(block, "vrtns:nstag");

    // Sommige feeds (Sporza) stoppen meerdere labels in één tag, gescheiden door
    // '|' of ','. Neem het eerste, met hoofdletter; val anders terug op de config.
    const firstTopic = clean(topicRaw).split(/[|,]/)[0].trim();
    const topic = firstTopic
      ? firstTopic.charAt(0).toUpperCase() + firstTopic.slice(1)
      : cfg.topic || "Nieuws";

    items.push({
      source: cfg.source,
      topic,
      headline,
      summary: truncate(clean(summaryRaw)),
    });
  }
  return items;
}

async function fetchOne(cfg: FeedConfig): Promise<NewsItem[]> {
  try {
    const res = await fetch(cfg.url, {
      headers: { "User-Agent": "aura-ochtendroutine/1.0" },
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text(), cfg);
  } catch {
    return [];
  }
}

export async function fetchNews(): Promise<Sourced<NewsItem[]>> {
  const now = Date.now();
  const results = await Promise.all(NEWS_FEEDS.map(fetchOne));
  const items = results.flat();
  // Geen enkele feed leverde iets → discrete "niet beschikbaar"-status.
  if (items.length === 0) return { source: "live", fetchedAt: now, data: null };
  return { source: "live", fetchedAt: now, data: items };
}
