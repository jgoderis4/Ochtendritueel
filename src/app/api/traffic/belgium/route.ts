/**
 * Algemeen filebeeld voor België (TomTom Traffic Incidents). Server-side zodat de
 * TomTom-sleutel niet in de browser belandt. 3 min gecachet.
 */
import { getBelgiumTraffic } from "@/lib/traffic/belgium";

export async function GET() {
  return Response.json(await getBelgiumTraffic());
}
