import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Panel, Tile } from "@/components/tv/Tile";
import { DailyBackground } from "@/components/tv/DailyBackground";
import { WorldWeather } from "@/components/tv/WorldWeather";
import { BelgiumTraffic } from "@/components/tv/BelgiumTraffic";
import { backgroundForDay } from "@/lib/backgrounds";
import { factsForDay } from "@/lib/facts";
import { formatCountdown } from "@/lib/routine/timeline";
import type { ScreenProps } from "./types";

/**
 * Vast dashboard (01:00–10:00 en na de workout). Vaste 4-tegelindeling:
 * weer · verkeer · nieuws · afval (gemockte adapters, D-003/D-004). Header-klok
 * en de resttijd tot het einde lopen live uit de routine.
 */
export function DashboardScreen({ data, routine }: ScreenProps) {
  const { now, mounted, remaining } = routine;
  const { kust, bestemming, news, waste } = data;
  const bg = backgroundForDay();
  const facts = factsForDay();

  return (
    <div className="relative isolate flex h-screen flex-col gap-4 overflow-hidden px-14 py-5">
      <DailyBackground />
      <TvHeader now={now} phaseLabel="Dashboard" />

      <main className="flex min-h-0 flex-1 gap-5">
        {/* === Linkerkolom: weer === */}
        <div className="flex w-[44%] min-h-0 flex-col">
        <Tile
          compact
          label="Weer · Kust & Bestemming"
          chip={
            kust.source === "live"
              ? <Chip tone="emerald">Live · Open-Meteo</Chip>
              : <Chip tone="coastal">Voorbeelddata</Chip>
          }
        >
          {!kust.data && (
            <p className="text-body-md text-text-mid">Weergegevens tijdelijk niet beschikbaar.</p>
          )}
          {kust.data && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-headline-lg font-semibold text-text-high">
                    {kust.data.location}
                  </p>
                  <p className="text-body-md text-coastal">{kust.data.condition}</p>
                </div>
                <p className="tabular font-display text-5xl font-semibold text-text-high">
                  {kust.data.tempC}°
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Panel>
                  <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Regenkans</p>
                  <p className="tabular text-headline-md font-semibold text-text-high">{kust.data.rainChancePct}%</p>
                </Panel>
                <Panel>
                  <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Wind</p>
                  <p className="text-body-md font-semibold text-text-high">{kust.data.windText}</p>
                </Panel>
                <Panel>
                  <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Rest vd dag</p>
                  <p className="text-body-md font-semibold text-text-high">{kust.data.forecastText}</p>
                </Panel>
              </div>
              <div className="flex justify-between text-label-md tabular text-text-mid">
                <span>☀ Zonsopgang {kust.data.sunrise}</span>
                <span>☾ Zonsondergang {kust.data.sunset}</span>
              </div>
              {bestemming.data && (
                <div className="mt-1 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-body-lg font-semibold text-text-high">⌖ {bestemming.data.location}</p>
                    <p className="text-label-md text-text-mid">
                      Regen {bestemming.data.rainChancePct}% · {bestemming.data.windText} · {bestemming.data.forecastText}
                    </p>
                  </div>
                  <p className="tabular text-headline-lg font-semibold text-text-high">{bestemming.data.tempC}°</p>
                </div>
              )}

              {/* Roterende weertegel: wisselt om de 30 s van wereldstad. */}
              <WorldWeather />
            </div>
          )}
        </Tile>
        </div>

        {/* === Rechterkolom: verkeer · nieuws · afval · weetjes === */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* --- Verkeer (algemeen filebeeld België) --- */}
        <Tile compact label="Verkeer · België" chip={<Chip tone="coastal">Live · TomTom</Chip>}>
          <BelgiumTraffic />
        </Tile>

        {/* --- Nieuws --- */}
        <Tile
          compact
          label="Nieuwsoverzicht · België & Regio"
          chip={
            news.source === "live"
              ? <Chip tone="emerald">Live · RSS</Chip>
              : <Chip tone="muted">Voorbeelddata</Chip>
          }
        >
          {!news.data?.length && (
            <p className="text-body-md text-text-mid">Nieuws tijdelijk niet beschikbaar.</p>
          )}
          {/* Alleen titels (de samenvatting werd toch afgebroken) → meer artikels. */}
          <ul className="flex flex-col gap-2">
            {news.data?.slice(0, 3).map((n, i) => (
              <li key={i} className="flex items-baseline gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="shrink-0 rounded-sm bg-surface-2 px-2 py-0.5 text-label-md font-semibold text-text-mid">{n.source}</span>
                <p className="text-body-md font-semibold text-text-high">{n.headline}</p>
              </li>
            ))}
          </ul>
        </Tile>

        {/* --- Afval --- */}
        <Tile
          compact
          label="Afvalophaling · Kalender"
          chip={
            waste.source === "live"
              ? <Chip tone="emerald">Live · Recycle!</Chip>
              : <Chip tone="coastal">Voorbeelddata</Chip>
          }
        >
          {!waste.data && (
            <p className="text-body-md text-text-mid">
              Afvalkalender tijdelijk niet beschikbaar. Laatst bekende gegevens worden getoond zodra de bron terug is.
            </p>
          )}
          {waste.data && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Status vandaag</p>
                  <p className="text-headline-lg font-semibold text-text-high">
                    {waste.data.todayFractions.length === 0 ? "Vandaag: geen ophaling" : waste.data.todayFractions.join(", ")}
                  </p>
                </div>
                {waste.data.todayFractions.length === 0 && (
                  <span className="grid size-10 place-items-center rounded-full border border-emerald text-emerald">✓</span>
                )}
              </div>
              {waste.data.next && (
                <div className="rounded-md border border-border bg-surface-2/70 p-4">
                  <p className="text-label-md uppercase tracking-[0.04em] text-amber">Eerstvolgende ophaling</p>
                  <p className="text-headline-md font-semibold text-text-high">{waste.data.next.date}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {waste.data.next.fractions.map((f) => (
                      <span key={f} className="rounded-full bg-surface px-3 py-1 text-label-md text-text-mid">{f}</span>
                    ))}
                  </div>
                  {waste.data.next.putOutFrom && (
                    <p className="mt-2 text-label-md text-text-mid">{waste.data.next.putOutFrom}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Tile>

        {/* --- Weetjes van de dag (3, rouleren dagelijks) --- */}
        <Tile
          compact
          label="Weetjes van de dag · leer elke ochtend iets bij"
          chip={<Chip tone="amber">Nieuw</Chip>}
        >
          <ul className="flex flex-col gap-2">
            {facts.map((f, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-amber/20 text-label-md font-semibold text-amber">
                  {i + 1}
                </span>
                <p className="text-body-md text-text-high">{f}</p>
              </li>
            ))}
          </ul>
        </Tile>
        </div>
      </main>

      <footer className="flex items-center justify-between text-label-md text-text-muted">
        <span>📍 Achtergrond: {bg.name}</span>
        <span className="tabular">
          {mounted ? `Nog ${formatCountdown(remaining)} tot einde routine` : "Routine loopt"}
        </span>
      </footer>
    </div>
  );
}
