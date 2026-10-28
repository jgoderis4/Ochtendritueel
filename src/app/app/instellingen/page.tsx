"use client";

import { MUSIC_STYLES, type NewsSourceKey } from "@/lib/settings/types";
import { useApp } from "../AppProvider";

const NEWS: { key: NewsSourceKey; label: string }[] = [
  { key: "HLN", label: "HLN · Belgisch & internationaal" },
  { key: "DeTijd", label: "De Tijd · economie & bedrijven" },
  { key: "Regionaal", label: "Regionaal · Koksijde" },
  { key: "Sporza", label: "Sporza · sport" },
];

export default function SettingsPage() {
  const { settings, setSettings } = useApp();

  return (
    <main className="flex flex-col gap-6">
      <h1 className="font-display text-headline-xl font-semibold text-text-high">
        Instellingen
      </h1>

      {/* Starttijden */}
      <Group title="Starttijden">
        <Row label="Werkdagen (ma–vr)">
          <TimeInput
            value={settings.startWeekday}
            onChange={(v) => setSettings({ startWeekday: v })}
          />
        </Row>
        <Row label="Weekend (za–zo)">
          <TimeInput
            value={settings.startWeekend}
            onChange={(v) => setSettings({ startWeekend: v })}
          />
        </Row>
        <Row label="Belgische feestdagen">
          <TimeInput
            value={settings.startHoliday}
            onChange={(v) => setSettings({ startHoliday: v })}
          />
        </Row>
      </Group>

      {/* Muziek */}
      <Group title="Muziek">
        <Row label={`Achtergrondvolume · ${settings.volume}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(e) => setSettings({ volume: Number(e.target.value) })}
            className="w-40 accent-[var(--color-amber)]"
          />
        </Row>
        <Row label="Standaard muziekstijl">
          <select
            value={settings.musicStyle}
            onChange={(e) => setSettings({ musicStyle: e.target.value as typeof settings.musicStyle })}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-body-md text-text-high"
          >
            {MUSIC_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Row>
      </Group>

      {/* Nieuwsbronnen */}
      <Group title="Nieuwsbronnen">
        {NEWS.map((n) => (
          <Toggle
            key={n.key}
            label={n.label}
            on={settings.newsSources[n.key]}
            onToggle={() =>
              setSettings({
                newsSources: {
                  ...settings.newsSources,
                  [n.key]: !settings.newsSources[n.key],
                },
              })
            }
          />
        ))}
      </Group>

      {/* Einde van de routine */}
      <Group title="Einde van de routine">
        <Row label={`Maximale duur · ${settings.maxDurationMin} min`}>
          <input
            type="range"
            min={15}
            max={45}
            step={5}
            value={settings.maxDurationMin}
            onChange={(e) => setSettings({ maxDurationMin: Number(e.target.value) })}
            className="w-40 accent-[var(--color-amber)]"
          />
        </Row>
        <Toggle
          label="Tv uitschakelen aan het einde (indien ondersteund)"
          on={settings.turnOffTvAtEnd}
          onToggle={() => setSettings({ turnOffTvAtEnd: !settings.turnOffTvAtEnd })}
        />
      </Group>

      {/* Vakantiemodus */}
      <Group title="Vakantiemodus">
        <Toggle
          label="Vakantiemodus actief"
          on={settings.vacation.enabled}
          onToggle={() =>
            setSettings({
              vacation: { ...settings.vacation, enabled: !settings.vacation.enabled },
            })
          }
        />
        {settings.vacation.enabled && (
          <>
            <Row label="Van">
              <input
                type="date"
                value={settings.vacation.from ?? ""}
                onChange={(e) =>
                  setSettings({ vacation: { ...settings.vacation, from: e.target.value } })
                }
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-body-md text-text-high"
              />
            </Row>
            <Row label="Tot">
              <input
                type="date"
                value={settings.vacation.to ?? ""}
                onChange={(e) =>
                  setSettings({ vacation: { ...settings.vacation, to: e.target.value } })
                }
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-body-md text-text-high"
              />
            </Row>
            <p className="text-label-md text-text-muted">
              Tijdens vakantie: automatische routine, wekker, tv en muziek uit. Handmatig
              starten blijft mogelijk. Normaal schema hervat automatisch na de einddatum.
            </p>
          </>
        )}
      </Group>

      <p className="text-label-md text-text-muted">
        Instellingen worden lokaal bewaard (Fase 1). Nog niet alle instellingen sturen al
        een live bron aan.
      </p>
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface/90 p-5">
      <h2 className="mb-3 text-label-lg font-semibold uppercase tracking-[0.06em] text-text-mid">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-body-md text-text-high">{label}</span>
      {children}
    </div>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="tabular rounded-md border border-border bg-surface-2 px-3 py-2 text-body-md text-text-high"
    />
  );
}

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between gap-4 text-left"
    >
      <span className="text-body-md text-text-high">{label}</span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          on ? "bg-emerald" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-text-high transition-all ${
            on ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}
