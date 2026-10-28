import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Tile } from "@/components/tv/Tile";
import { formatClock, formatDate } from "@/lib/routine/clock";
import type { ScreenProps } from "./types";

/**
 * Afsluitscherm wanneer de routine klaar is (30:00 bereikt). Rustige afsluiting;
 * muziek/tv stoppen hoort hier later bij (afhankelijk van het tv-model, O-1).
 */
export function EndedScreen({ data, routine }: ScreenProps) {
  const { now } = routine;
  const traffic = data.traffic;

  return (
    <div className="flex min-h-screen flex-col gap-8 px-14 py-8">
      <TvHeader now={now} phaseLabel="Afgerond" />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div>
          <p className="tabular font-display text-display-clock font-bold leading-none text-text-high">
            {formatClock(now)}
          </p>
          <p className="mt-3 text-headline-lg font-semibold text-text-mid">{formatDate(now) || "—"}</p>
        </div>

        <Tile label="Routine afgerond" chip={<Chip tone="emerald">Klaar</Chip>}>
          <div className="flex flex-col gap-3">
            <p className="text-headline-md font-semibold text-text-high">
              Fijne dag! Je ochtendroutine zit erop.
            </p>
            {traffic.data && (
              <p className="text-body-lg text-text-mid">
                Vertrek uiterlijk {traffic.data.leaveBy} uur · {traffic.data.fromTo} ({traffic.data.durationMin} min).
              </p>
            )}
            <p className="text-body-md text-text-muted">
              De muziek stopt en de tv gaat uit indien ondersteund (afhankelijk van het toestel).
            </p>
          </div>
        </Tile>
      </main>

      <footer className="text-center text-label-md text-text-muted">
        Routine beëindigd · start morgen opnieuw vanaf de app
      </footer>
    </div>
  );
}
