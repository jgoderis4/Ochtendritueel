import { TvPreview } from "@/components/tv/TvPreview";
import { getTvData } from "@/lib/adapters/tv-data";

/**
 * Losse live preview van het welkomstscherm (00:00–01:00). Toont dit scherm
 * ongeacht de routinefase; de klok loopt live. De automatische doorloop staat op /tv.
 */
export default async function WelcomePreviewPage() {
  const data = await getTvData();
  return <TvPreview screen="welcome" data={data} />;
}
