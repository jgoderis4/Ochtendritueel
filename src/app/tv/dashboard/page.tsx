import { getAdapters } from "@/lib/adapters";
import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Panel, Tile } from "@/components/tv/Tile";

/**
 * Vast dashboard (01:00–10:00). Centrale scherm met 4 vaste tegels:
 * weer · verkeer · nieuws · afval. Data komt uit de mock-adapters (D-003/D-004).
 * Vaste indeling, elke dag gelijk — geen herschikking (briefing §4).
 */
export default async function DashboardPage() {
  const a = getAdapters();
  const [kust, bestemming, traffic, news, waste] = await Promise.all([
    a.weather.getWeather("Oostduinkerke"),
    a.weather.getWeather("Gistel"),
    a.traffic.getTraffic(),
    a.news.getHeadlines(),
    a.waste.getCollection(),
  ]);

  return (
    <div className="flex min-h-screen flex-col gap-8 px-14 py-8">
      <TvHeader phaseLabel="Dashboard" />

      <main className="grid flex-1 grid-cols-1 gap-7 lg:grid-cols-2">
        {/* --- Weer --- */}
        <Tile label="Weer · Kust & Bestemming" chip={<Chip tone="coastal">Live kuststation</Chip>}>
          {kust.data && (
            <div className="flex flex-col gap-5">
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
            </div>
          )}
        </Tile>

        {/* --- Verkeer --- */}
        <Tile
          label="Verkeer · Traject & Vertrek"
          chip={<Chip tone={traffic.data?.flow === "vlot" ? "emerald" : "amber"}>
            {traffic.data?.flow === "vlot" ? "Vlot verkeer" : "Vertraging"}
          </Chip>}
        >
          {traffic.data && (
            <div className="flex flex-col gap-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Snelste traject</p>
                  <p className="text-headline-lg font-semibold text-text-high">{traffic.data.fromTo}</p>
                  <p className="text-body-md text-text-mid">Via {traffic.data.via}</p>
                </div>
                <div className="text-right">
                  <p className="tabular font-display text-5xl font-semibold text-emerald">{traffic.data.durationMin}<span className="text-headline-md"> min</span></p>
                  <p className="tabular text-label-md text-text-mid">{traffic.data.distanceKm} km</p>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full w-full bg-emerald" />
              </div>
              <p className="text-body-md text-emerald">
                {traffic.data.incidents.length === 0
                  ? "✓ Geen ongevallen of hinder gemeld op de route."
                  : traffic.data.incidents.join(" · ")}
              </p>
              <div className="rounded-md border border-amber/40 bg-amber/10 p-5">
                <p className="text-label-md uppercase tracking-[0.04em] text-amber">Aanbevolen vertrektijd</p>
                <p className="text-headline-md font-semibold text-text-high">Uiterlijk {traffic.data.leaveBy} uur</p>
                <p className="text-label-md text-text-mid">Berekend met ochtendspitsbuffer.</p>
              </div>
            </div>
          )}
        </Tile>

        {/* --- Nieuws --- */}
        <Tile label="Nieuwsoverzicht · België & Regio" chip={<Chip tone="muted">Laatste update 07:00</Chip>}>
          <ul className="flex flex-col gap-4">
            {news.data?.map((n, i) => (
              <li key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-sm bg-surface-2 px-2 py-0.5 text-label-md font-semibold text-text-mid">{n.source}</span>
                  <span className="text-label-md text-text-muted">{n.topic}</span>
                </div>
                <p className="text-body-md font-semibold text-text-high">{n.headline}</p>
                <p className="text-label-lg text-text-mid">{n.summary}</p>
              </li>
            ))}
          </ul>
        </Tile>

        {/* --- Afval --- */}
        <Tile label="Afvalophaling · Kalender" chip={<Chip tone="coastal">Zone Oost</Chip>}>
          {waste.data && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-label-md uppercase tracking-[0.04em] text-text-mid">Aangewezen adres</p>
                <p className="text-headline-md font-semibold text-text-high">{waste.data.address}</p>
              </div>
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
                <div className="rounded-md border border-border bg-surface-2/70 p-5">
                  <p className="text-label-md uppercase tracking-[0.04em] text-amber">Eerstvolgende ophaling</p>
                  <p className="text-headline-md font-semibold text-text-high">{waste.data.next.date}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {waste.data.next.fractions.map((f) => (
                      <span key={f} className="rounded-full bg-surface px-3 py-1 text-label-md text-text-mid">{f}</span>
                    ))}
                  </div>
                  {waste.data.next.putOutFrom && (
                    <p className="mt-3 text-label-md text-text-mid">{waste.data.next.putOutFrom}</p>
                  )}
                </div>
              )}
              <p className="text-label-md text-text-muted">Bron: officiële afvalkalender (voorbeelddata)</p>
            </div>
          )}
        </Tile>
      </main>

      <footer className="flex items-center justify-between text-label-md text-text-muted">
        <span>● Scherm 2 van 4: Dashboard · vaste rasterweergave</span>
        <span>Helderheid gedimd (slaapkamermodus)</span>
      </footer>
    </div>
  );
}
