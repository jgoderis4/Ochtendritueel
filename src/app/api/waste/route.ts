/**
 * Route handler voor de afvalkalender. Draait server-side zodat client-componenten
 * (bv. de testpagina) de live data zonder CORS kunnen ophalen.
 */
import { fetchWasteCollection } from "@/lib/waste/fostplus";

export async function GET() {
  const result = await fetchWasteCollection();
  return Response.json(result);
}
