/**
 * Route handler voor verkeer. Server-side zodat client-componenten (testpagina) de
 * live reistijd zonder CORS kunnen ophalen.
 */
import { fetchTraffic } from "@/lib/traffic/routing";

export async function GET() {
  const result = await fetchTraffic();
  return Response.json(result);
}
