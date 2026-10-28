import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Tile } from "@/components/tv/Tile";
import { formatClock, formatDate, greeting } from "@/lib/routine/clock";
import type { ScreenProps } from "./types";

/**
 * Rustscherm wanneer er geen routine loopt. Eerlijk: echte klok + uitleg dat de
 * routine via de app/telefoon gestart wordt — geen nepcountdown (D-004).
 */
export function IdleScreen({ data, routine }: ScreenProps) {
  const { now } = routine;
  const kust = data.kust;

  return (
    <div className="flex min-h-screen flex-col gap-8 px-14 py-8">
      <TvHeader now={now} phaseLabel="Standby" />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div>
          <p className="tabular font-display text-display-clock font-bold leading-none text-text-high">
            {formatClock(now)}
          </p>
          <p className="mt-3 text-headline-lg font-semibold text-text-mid">{formatDate(now) || "—"}</p>
        </div>

        <Tile label="Routine" chip={<Chip tone="muted">Niet actief</Chip>}>
          <div className="flex flex-col gap-3">
            <p className="text-headline-md font-semibold text-text-high">
              {greeting(now)}. De ochtendroutine is nog niet gestart.
            </p>
            <p className="text-body-lg text-text-mid">
              Start de routine op je telefoon (Aura · bediening). Dit scherm volgt dan
              automatisch: welkom → dashboard → workout → einde.
            </p>
            {kust.data && (
              <p className="text-body-md text-coastal">
                Kust nu: {kust.data.tempC}° · {kust.data.condition}
              </p>
            )}
          </div>
        </Tile>
      </main>

      <footer className="text-center text-label-md text-text-muted">
        Wacht op start vanaf de app · voorbeelddata
      </footer>
    </div>
  );
}
