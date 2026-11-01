/**
 * Haalt alle adapterdata op die de TV-schermen nodig hebben (server-side).
 * Eén plek zodat /tv (runtime) en de losse previews dezelfde bundel delen.
 * In v1 zijn alle bronnen gemockt (D-003) en als voorbeelddata gelabeld (D-004).
 */

import { getAdapters } from "./index";
import type { TvData } from "@/components/tv/screens/types";

export async function getTvData(): Promise<TvData> {
  const a = getAdapters();
  const [kust, bestemming, traffic, news, waste, music] = await Promise.all([
    a.weather.getWeather("Oostduinkerke"),
    a.weather.getWeather("Gistel"),
    a.traffic.getTraffic(),
    a.news.getHeadlines(),
    a.waste.getCollection(),
    a.music.getState(),
  ]);
  return { kust, bestemming, traffic, news, waste, music };
}
