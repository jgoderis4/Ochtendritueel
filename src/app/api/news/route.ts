/**
 * Route handler voor nieuws. Server-side zodat client-componenten (testpagina) de
 * live feeds zonder CORS kunnen ophalen.
 */
import { fetchNews } from "@/lib/news/feeds";

export async function GET() {
  const result = await fetchNews();
  return Response.json(result);
}
