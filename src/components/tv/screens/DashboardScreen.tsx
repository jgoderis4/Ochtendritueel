import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Panel, Tile } from "@/components/tv/Tile";
import { DailyBackground } from "@/components/tv/DailyBackground";
import { WeekForecast } from "@/components/tv/WeekForecast";
import { BelgiumTraffic } from "@/components/tv/BelgiumTraffic";
import { PorscheTop } from "@/components/tv/PorscheTop";
import { backgroundForDay } from "@/lib/backgrounds";
import { factsForDay } from "@/lib/facts";
import { formatCountdown } from "@/lib/routine/timeline";
import type { ScreenProps } from "./types";

/**
 * Verdeelt nieuws evenwichtig over de bronnen: max `perSource` per bron, in de
 * volgorde waarin de bronnen voorkomen (bv. 2 VRT, 2 De Tijd, 2 Sporza). Zo
 * overheerst één drukke bron het overzicht niet.
 */
function balanceBySource<T extends { source: string }>(items: T[], perSource: number): T[] {
  const counts = new Map<string, number>();
  const out: T[] = [];
  for (const item of items) {
    const n = counts.get(item.source) ?? 0;
    if (n >= perSource) continue;
    counts.set(item.source, n + 1);
    out.push(item);
  }
  return out;
}

/**
 * Vast dashboard (01:00–10:00 en na de workout). Vaste 4-tegelindeling:
 * weer · verkeer · nieuws · afval (gemockte adapters, D-003/D-004). Header-klok
 * en de resttijd tot het einde lopen live uit de routine.
 */
export function DashboardScreen({ data, routine }: ScreenProps) {
  const { now, mounted, remaining } = routine;
  const { kust, news, waste } = data;
  const bg = backgroundForDay();
  const facts = factsForDay();
  // Nieuws gelijk verdelen: max 2 per bron (VRT, De Tijd, Sporza) → evenwichtig beeld.
  const balancedNews = balanceBySource(news.data ?? [], 2);

  return (
    <div className="relative isolate flex h-screen flex-col gap-4 overflow-hidden px-14 py-5">
      <DailyBackground />
      <TvHeader now={now} phaseLabel="Dashboard" />

      <main className="flex min-h-0 flex-1 gap-5">
        {/* === Linkerkolom: weer + weetjes === */}
        <div className="flex w-[44%] min-h-0 flex-col gap-4">
        <Tile
          compact
          label="Weer · Kust"
          chip={
            kust.source === "live"
              ? <Chip tone="emerald">Live · weer</Chip>
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
              {/* Weekverwachting voor Oostduinkerke (vaste 7-daagse strip). */}
              <WeekForecast />
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

        {/* --- Porsche · top 3 wagens van de dag (porsche-tracker) --- */}
        <Tile compact label="Porsche · Top 3 van de dag" chip={<Chip tone="muted">Tracker</Chip>}>
          <PorscheTop />
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
            {balancedNews.map((n, i) => (
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
