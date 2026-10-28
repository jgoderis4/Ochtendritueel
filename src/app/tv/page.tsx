import { TvRuntime } from "@/components/tv/TvRuntime";
import { getTvData } from "@/lib/adapters/tv-data";

/**
 * TV-kiosk (/tv). Haalt de adapterdata server-side op en laat de client-runtime
 * automatisch het scherm van de huidige routinefase tonen: standby → welkom →
 * dashboard → workout → afgerond. Synchroon met de app via de gedeelde store.
 * De losse preview van elk scherm staat op /tv/preview.
 */
export default async function TvPage() {
  const data = await getTvData();
  return <TvRuntime data={data} />;
}
