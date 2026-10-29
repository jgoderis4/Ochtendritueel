/**
 * Route handler voor het weer. Server-side zodat client-componenten (testpagina)
 * de live data zonder CORS kunnen ophalen. ?location=Oostduinkerke|Gistel.
 */
import { fetchWeather } from "@/lib/weather/openmeteo";
import { WEATHER_LOCATIONS, type WeatherLocation } from "@/lib/weather/config";

export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get("location");
  const location: WeatherLocation =
    param && param in WEATHER_LOCATIONS ? (param as WeatherLocation) : "Oostduinkerke";
  const result = await fetchWeather(location);
  return Response.json(result);
}
