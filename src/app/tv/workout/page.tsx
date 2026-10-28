import { getAdapters } from "@/lib/adapters";
import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Tile } from "@/components/tv/Tile";
import { WORKOUT_A } from "@/lib/routine/workouts";

/**
 * Workoutscherm (vanaf 10:00). Stilstaand oefenbeeld (placeholder), naam,
 * korte instructie, per-oefening countdown en een 30-min countdown tot het
 * automatische einde. Muziek blijft spelen. In Fase 1 statische voorbeeldwaarden;
 * de live timers worden in een latere stap aan de routine-kern gekoppeld.
 */
export default async function WorkoutPage() {
  const a = getAdapters();
  const music = await a.music.getState();

  const workout = WORKOUT_A;
  const current = workout.exercises[1]; // "Aangepaste Push-ups" (zoals in het design)
  const next = workout.exercises[2];
  const index = 2;
  const total = workout.exercises.length;

  return (
    <div className="flex min-h-screen flex-col gap-8 px-14 py-8">
      <TvHeader phaseLabel="Workout" />

      {/* Statusbalk: workout + 30-min countdown */}
      <section className="flex items-center justify-between rounded-lg border border-border bg-surface/80 px-8 py-5">
        <div className="flex items-center gap-5">
          <span className="grid size-12 place-items-center rounded-full bg-emerald/20 text-emerald">🏋</span>
          <div>
            <p className="text-label-md uppercase tracking-[0.04em] text-emerald">
              Ochtendregime · doelduur 7 min
            </p>
            <p className="text-headline-md font-semibold text-text-high">{workout.title.replace("·", "•")} — {workout.focus}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="tabular font-display text-5xl font-semibold text-amber">
            18:45 <span className="text-body-md text-text-mid">resterend</span>
          </p>
          <p className="text-label-md text-text-mid">tot automatisch einde (30:00 max)</p>
        </div>
      </section>

      <main className="grid flex-1 grid-cols-1 gap-7 lg:grid-cols-2">
        {/* Oefening: beeld + instructie */}
        <Tile
          label={`Oefening ${index} van ${total} · ${workout.title}`}
          chip={<Chip tone="amber">Spiergroep: {current.muscleGroup}</Chip>}
        >
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-display-metric font-semibold text-text-high">
              {current.name}
              {current.nameEn && (
                <span className="ml-3 text-headline-md font-normal text-text-mid">({current.nameEn})</span>
              )}
            </h1>

            {/* Placeholder-oefenbeeld (geen animatie/video — briefing §6) */}
            <div className="grid h-56 place-items-center rounded-md border border-border bg-surface-2/70">
              <div className="text-center">
                <span className="text-5xl" aria-hidden>🧘</span>
                <p className="mt-2 text-label-md uppercase tracking-[0.04em] text-text-muted">
                  Stilstaand oefenbeeld · placeholder
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {current.cues.map((c) => (
                <span key={c} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-label-md text-emerald">
                  ✓ {c}
                </span>
              ))}
            </div>

            <div className="rounded-md border border-border bg-surface-2/50 p-5">
              <p className="text-label-md uppercase tracking-[0.04em] text-amber">Houding & uitvoering</p>
              <p className="mt-1 text-body-lg text-text-high">{current.instructions}</p>
            </div>
          </div>
        </Tile>

        {/* Countdown + volgende oefening */}
        <div className="flex flex-col gap-7">
          <Tile label="Resterend in set" chip={<Chip tone="emerald">Actieve oefening</Chip>}>
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className="grid size-56 place-items-center rounded-full border-8 border-border"
                style={{ borderTopColor: "var(--color-amber)" }}
              >
                <div className="text-center">
                  <p className="tabular font-display text-display-lg font-bold leading-none text-text-high">00:42</p>
                  <p className="mt-1 text-label-lg uppercase tracking-[0.06em] text-amber">seconden</p>
                </div>
              </div>
              <p className="text-label-md text-text-mid">● Tempo: 2 sec neer, 1 sec omhoog</p>
            </div>
          </Tile>

          <Tile label="Aankomende oefening">
            <div className="flex items-center gap-5">
              <span className="grid size-14 place-items-center rounded-md bg-coastal/20 text-2xl" aria-hidden>🧎</span>
              <div className="flex-1">
                <p className="text-headline-md font-semibold text-text-high">{next.name}</p>
                <p className="text-body-md text-text-mid">{next.muscleGroup} · {next.seconds} seconden</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-label-md text-text-mid">Routine voortgang:</span>
              {workout.exercises.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < index ? "bg-emerald" : i === index ? "bg-amber" : "bg-border"}`}
                />
              ))}
            </div>
          </Tile>
        </div>
      </main>

      {/* Muziek + bediening */}
      <footer className="flex items-center justify-between gap-8 rounded-lg border border-border bg-surface/80 px-8 py-5">
        <div className="flex items-center gap-5">
          <span className="grid size-12 place-items-center rounded-md bg-coastal/20 text-xl" aria-hidden>🎵</span>
          <div>
            <p className="text-label-md uppercase tracking-[0.04em] text-coastal">{music.data?.speaker} · Spotify actief</p>
            <p className="text-body-lg font-semibold text-text-high">Lounge Workout Mix · blijft doorspelen</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md border border-border bg-surface-2 px-5 py-3 text-body-md font-semibold text-text-high">❚❚ Pauzeren</span>
          <span className="rounded-md border border-border bg-surface-2 px-5 py-3 text-body-md font-semibold text-text-high">▸❙ Overslaan</span>
        </div>
      </footer>
    </div>
  );
}
