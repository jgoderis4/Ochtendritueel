import { TvHeader } from "@/components/tv/TvHeader";
import { Chip, Tile } from "@/components/tv/Tile";
import { formatCountdown, WORKOUT_DURATION } from "@/lib/routine/timeline";
import { workoutProgress } from "@/lib/routine/workout-engine";
import { workoutForDayIndex } from "@/lib/routine/workouts";
import type { ScreenProps } from "./types";

/** Dagen sinds epoch — doorlopende index voor de A/B-afwisseling. */
function dayIndexFor(now: number | null): number {
  if (now === null) return 0;
  return Math.floor(now / 86_400_000);
}

/**
 * Workoutscherm (vanaf 10:00, of eerder bij handmatige start). Live:
 *   - 30-min restcountdown tot het automatische einde;
 *   - per-oefening countdown + huidige/volgende oefening + voortgang,
 *     afgeleid van de verstreken workouttijd door de pure workout-engine.
 * Muziek blijft spelen. Oefenbeeld is een placeholder (briefing §6).
 */
export function WorkoutScreen({ data, routine }: ScreenProps) {
  const { now, mounted, remaining, workoutElapsed } = routine;
  const music = data.music;

  const workout = workoutForDayIndex(dayIndexFor(now));
  const prog = workoutProgress(workout, workoutElapsed);
  const current = prog.current;
  const next = prog.next;
  const doelMin = Math.round(WORKOUT_DURATION / 60_000);

  return (
    <div className="flex min-h-screen flex-col gap-8 px-14 py-8">
      <TvHeader now={now} phaseLabel="Workout" />

      {/* Statusbalk: workout + 30-min countdown */}
      <section className="flex items-center justify-between rounded-lg border border-border bg-surface/80 px-8 py-5">
        <div className="flex items-center gap-5">
          <span className="grid size-12 place-items-center rounded-full bg-emerald/20 text-emerald">🏋</span>
          <div>
            <p className="text-label-md uppercase tracking-[0.04em] text-emerald">
              Ochtendregime · doelduur {doelMin} min
            </p>
            <p className="text-headline-md font-semibold text-text-high">{workout.title.replace("·", "•")} — {workout.focus}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="tabular font-display text-5xl font-semibold text-amber">
            {mounted ? formatCountdown(remaining) : "—"} <span className="text-body-md text-text-mid">resterend</span>
          </p>
          <p className="text-label-md text-text-mid">tot automatisch einde (30:00 max)</p>
        </div>
      </section>

      <main className="grid flex-1 grid-cols-1 gap-7 lg:grid-cols-2">
        {/* Oefening: beeld + instructie */}
        <Tile
          label={`Oefening ${prog.displayIndex} van ${prog.total} · ${workout.title}`}
          chip={<Chip tone="amber">Spiergroep: {current.muscleGroup}</Chip>}
        >
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-display-metric font-semibold text-text-high">
              {current.name}
              {current.nameEn && (
                <span className="ml-3 text-headline-md font-normal text-text-mid">({current.nameEn})</span>
              )}
            </h1>

            {/* Oefen-demo: loopende animatie indien beschikbaar, anders icoon */}
            {current.video ? (
              <div className="h-56 overflow-hidden rounded-md border border-border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={current.video}
                  src={current.video}
                  alt={`Demo: ${current.name}`}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="grid h-56 place-items-center rounded-md border border-border bg-surface-2/70">
                <div className="text-center">
                  <span className="text-5xl" aria-hidden>🧘</span>
                  <p className="mt-2 text-label-md uppercase tracking-[0.04em] text-text-muted">
                    Oefenbeeld volgt
                  </p>
                </div>
              </div>
            )}

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
                  <p className="tabular font-display text-display-lg font-bold leading-none text-text-high">
                    {mounted ? formatCountdown(prog.secondsLeftInExercise * 1000) : "—"}
                  </p>
                  <p className="mt-1 text-label-lg uppercase tracking-[0.06em] text-amber">seconden</p>
                </div>
              </div>
              <p className="text-label-md text-text-mid">● {current.muscleGroup} · set van {prog.exerciseSeconds}s</p>
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
              <span className="text-label-md text-text-mid">Set-voortgang:</span>
              {workout.exercises.map((_, i) => {
                const activeIdx = prog.displayIndex - 1;
                return (
                  <span
                    key={i}
                    className={`h-2 flex-1 rounded-full ${i < activeIdx ? "bg-emerald" : i === activeIdx ? "bg-amber" : "bg-border"}`}
                  />
                );
              })}
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
            <p className="text-body-lg font-semibold text-text-high">{music.data?.playlist ?? "Muziek"} · blijft doorspelen</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md border border-border bg-surface-2 px-5 py-3 text-body-md font-semibold text-text-high">❚❚ Pauzeren via app</span>
          <span className="rounded-md border border-border bg-surface-2 px-5 py-3 text-body-md font-semibold text-text-high">▸❙ Overslaan via app</span>
        </div>
      </footer>
    </div>
  );
}
