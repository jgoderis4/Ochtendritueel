/**
 * Live nieuws-adapter (RSS/Atom). Server-side roept hij de feed-fetch rechtstreeks
 * aan; client-side via onze eigen /api/news-route (geen CORS). Bij falen: discrete
 * "niet beschikbaar"-status (data: null).
 */
import type { NewsAdapter, NewsItem, Sourced } from "../types";
import { fetchNews } from "@/lib/news/feeds";

export const liveNewsAdapter: NewsAdapter = {
  async getHeadlines(): Promise<Sourced<NewsItem[]>> {
    if (typeof window === "undefined") {
      return fetchNews();
    }
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Sourced<NewsItem[]>;
    } catch {
      return { source: "live", fetchedAt: Date.now(), data: null };
    }
  },
};
