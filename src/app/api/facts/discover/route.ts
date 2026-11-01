/**
 * Live "ontdek-weetje" uit de Nederlandse Wikipedia (willekeurige samenvatting).
 * Altijd nieuw/oneindig, zodat de weetjes-tegel nooit volledig herhaalt.
 * Haalt meerdere willekeurige artikels op en kiest het meest leesbare.
 * Bij falen: { title: null } → de UI toont dan gewoon de gecureerde weetjes.
 */

const RANDOM_URL = "https://nl.wikipedia.org/api/rest_v1/page/random/summary";

interface Summary {
  type?: string;
  title?: string;
  extract?: string;
}

async function fetchOne(): Promise<Summary | null> {
  try {
    const res = await fetch(RANDOM_URL, {
      headers: { "User-Agent": "aura-ochtendroutine/1.0 (persoonlijk dashboard)" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Summary;
  } catch {
    return null;
  }
}

/** Is dit een leesbaar, interessant weetje (geen lijst/jaartal/dooddoener)? */
function usable(s: Summary | null): s is Required<Pick<Summary, "title" | "extract">> {
  if (!s || s.type !== "standard" || !s.title || !s.extract) return false;
  const text = s.extract.trim();
  if (text.length < 50 || text.length > 360) return false;
  if (/^\d/.test(s.title)) return false; // bv. "Augustus 1933"
  if (/^lijst van/i.test(s.title)) return false;
  return true;
}

export async function GET() {
  // Enkele parallel ophalen en de beste kiezen.
  const candidates = await Promise.all([fetchOne(), fetchOne(), fetchOne(), fetchOne()]);
  const good = candidates.filter(usable);
  // Kortste bruikbare extract leest het vlotst als one-liner.
  good.sort((a, b) => a.extract.length - b.extract.length);
  const pick = good[0];
  if (!pick) return Response.json({ title: null });
  return Response.json({ title: pick.title, text: pick.extract.trim() });
}
