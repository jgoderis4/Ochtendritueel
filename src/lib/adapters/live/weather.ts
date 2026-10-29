/**
 * Live weer-adapter (Open-Meteo). Server-side roept hij de fetch rechtstreeks aan;
 * client-side via onze eigen /api/weather-route (geen CORS). Bij falen: discrete
 * "niet beschikbaar"-status (data: null).
 */
import type { Sourced, WeatherAdapter, WeatherNow } from "../types";
import { fetchWeather } from "@/lib/weather/openmeteo";

export const liveWeatherAdapter: WeatherAdapter = {
  async getWeather(location): Promise<Sourced<WeatherNow>> {
    if (typeof window === "undefined") {
      return fetchWeather(location);
    }
    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Sourced<WeatherNow>;
    } catch {
      return { source: "live", fetchedAt: Date.now(), data: null };
    }
  },
};
