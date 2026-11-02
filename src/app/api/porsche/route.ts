/**
 * Top wagens uit het porsche-tracker-project (server-side bestand op de Mac).
 * 10 min gecachet; de tracker ververst zelf maar 2x/dag.
 */
import { getPorscheTop } from "@/lib/porsche/porsche";

export const revalidate = 600;

export async function GET() {
  return Response.json(await getPorscheTop(3));
}
