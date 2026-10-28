import { TvPreview } from "@/components/tv/TvPreview";
import { getTvData } from "@/lib/adapters/tv-data";

/**
 * Losse live preview van het vaste dashboard (01:00–10:00). De automatische
 * doorloop tussen alle schermen staat op /tv.
 */
export default async function DashboardPreviewPage() {
  const data = await getTvData();
  return <TvPreview screen="dashboard" data={data} />;
}
