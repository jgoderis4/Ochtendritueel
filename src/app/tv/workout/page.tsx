import { TvPreview } from "@/components/tv/TvPreview";
import { getTvData } from "@/lib/adapters/tv-data";

/**
 * Losse live preview van het workoutscherm. Tijdens een lopende routine lopen de
 * set- en 30-min-countdown live; los bekeken toont het de layout met de eerste
 * oefening. De automatische doorloop staat op /tv.
 */
export default async function WorkoutPreviewPage() {
  const data = await getTvData();
  return <TvPreview screen="workout" data={data} />;
}
