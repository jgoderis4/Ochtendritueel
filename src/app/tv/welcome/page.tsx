import { getAdapters } from "@/lib/adapters";
import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Tile } from "@/components/tv/Tile";

/** Een dagelijks wisselende quote; vast in Fase 1 (geen Date-afhankelijkheid). */
const QUOTE = "Elke ochtend brengt nieuwe energie en een heldere blik.";

/**
 * Welkomstscherm (00:00–01:00, duur 1 min). Klok, datum, begroeting, een
 * weerbewuste boodschap, quote van de dag en de muziek die opstart.
 */
export default async function WelcomePage() {
  const a = getAdapters();
  const [kust, music] = await Promise.all([
    a.weather.getWeather("Oostduinkerke"),
    a.music.getState(),
  ]);

  return (
    <div className="flex min-h-screen flex-col gap-8 px-14 py-8">
      <TvHeader phaseLabel="Welkom" />

      <main className="grid flex-1 grid-cols-1 gap-7 lg:grid-cols-2">
        {/* Klok + begroeting */}
        <Tile label="Ochtendritme 00:00 – 01:00" chip={<Chip tone="muted">Slaapstand beëindigd</Chip>}>
          <div className="flex flex-col gap-5">
            <p className="tabular font-display text-display-clock font-bold leading-none text-text-high">
              07:02
            </p>
            <p className="text-headline-lg font-semibold text-text-mid">📅 Vrijdag 24 mei</p>
            <div className="mt-2 border-t border-border pt-5">
              <p className="text-headline-lg font-semibold text-text-high">
                Goedemorgen, tijd voor een rustige start.
              </p>
              <p className="mt-2 text-body-lg text-text-mid">
                Een heldere en zonnige ochtend aan de kust. Perfect voor een productieve dag.
              </p>
            </div>
          </div>
        </Tile>

        {/* Weer kust */}
        <Tile label={`Kust · ${kust.data?.location ?? ""}`} chip={<Chip tone="coastal">Noordzee</Chip>}>
          {kust.data && (
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="tabular font-display text-display-metric font-semibold text-text-high">
                    {kust.data.tempC}°C
                  </p>
                  <p className="text-body-lg text-coastal">{kust.data.condition}</p>
                </div>
                <span className="text-5xl" aria-hidden>☀️</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-5">
                <div>
                  <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Wind</p>
                  <p className="text-headline-md font-semibold text-text-high">{kust.data.windText}</p>
                </div>
                <div>
                  <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Zon</p>
                  <p className="tabular text-headline-md font-semibold text-text-high">
                    ↑ {kust.data.sunrise} · ↓ {kust.data.sunset}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Tile>

        {/* Quote */}
        <Tile label="Gedachte van de dag">
          <p className="font-display text-headline-lg italic leading-snug text-text-high">
            “{QUOTE}”
          </p>
        </Tile>

        {/* Muziek start */}
        <Tile label="Muziek · start routine" chip={<Chip tone="emerald">Start</Chip>}>
          {music.data && (
            <div className="flex items-center gap-5">
              <span className="grid size-16 place-items-center rounded-md bg-coastal/20 text-3xl" aria-hidden>🎵</span>
              <div className="flex-1">
                <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">{music.data.speaker}</p>
                <p className="text-headline-md font-semibold text-text-high">{music.data.playlist}</p>
                <p className="text-body-md text-text-mid">Spotify · achtergrondvolume {music.data.volumePct}%</p>
              </div>
            </div>
          )}
        </Tile>
      </main>

      <footer className="flex items-center justify-between rounded-lg border border-border bg-surface/80 px-8 py-5">
        <div>
          <p className="text-body-lg font-semibold text-text-high">
            Routine gestart · volledig dashboard verschijnt zo
          </p>
          <p className="text-label-md text-text-mid">Of druk op [OK] op de afstandsbediening</p>
        </div>
        <span className="rounded-md bg-amber px-5 py-3 text-body-md font-semibold text-canvas">
          Meteen openen
        </span>
      </footer>
    </div>
  );
}
