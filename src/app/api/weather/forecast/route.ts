/**
 * Route handler voor de weekverwachting. Server-side zodat client-componenten de
 * live data zonder CORS kunnen ophalen. ?location=Oostduinkerke|Gistel (default Kust).
 */
import { fetchForecast } from "@/lib/weather/forecast";
import { WEATHER_LOCATIONS, type WeatherLocation } from "@/lib/weather/config";

export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get("location");
  const location: WeatherLocation =
    param && param in WEATHER_LOCATIONS ? (param as WeatherLocation) : "Oostduinkerke";
  const days = await fetchForecast(location);
  return Response.json({ location, days });
}
