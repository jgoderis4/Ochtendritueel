/**
 * Route handler voor de agenda. GET levert UITSLUITEND de afgeleide bestemming
 * voor vandaag (D-005: nooit afspraakdetails). Server-side zodat de client geen
 * Microsoft-secret of CORS nodig heeft.
 */
import { getCommuteOverride } from "@/lib/calendar/graph";

export async function GET() {
  const result = await getCommuteOverride();
  return Response.json(result);
}
