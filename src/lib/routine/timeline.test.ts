import { describe, expect, it } from "vitest";
import {
  currentPhase,
  elapsedMs,
  INITIAL_STATE,
  MINUTE,
  remainingMs,
  TIMELINE,
  WORKOUT_DURATION,
  workoutElapsedMs,
  type RoutineState,
} from "./timeline";

const T0 = 1_000_000_000_000;
/** Hulp: staat die loopt sinds T0, plus overschrijvingen. */
function running(overrides: Partial<RoutineState> = {}): RoutineState {
  return { ...INITIAL_STATE, startedAt: T0, ...overrides };
}
const at = (ms: number) => T0 + ms;

describe("currentPhase", () => {
  it("is 'ended' zonder gestarte routine", () => {
    expect(currentPhase(INITIAL_STATE, T0)).toBe("ended");
  });
  it("toont welkom in de eerste minuut", () => {
    expect(currentPhase(running(), at(0))).toBe("welcome");
    expect(currentPhase(running(), at(30_000))).toBe("welcome");
  });
  it("toont dashboard na de welkomstminuut", () => {
    expect(currentPhase(running(), at(5 * MINUTE))).toBe("dashboard");
  });
  it("toont workout vanaf 10 min tot de doelduur", () => {
    expect(currentPhase(running(), at(TIMELINE.workoutAutoStart))).toBe("workout");
    expect(
      currentPhase(running(), at(TIMELINE.workoutAutoStart + WORKOUT_DURATION - 1)),
    ).toBe("workout");
  });
  it("keert na de workout terug naar dashboard", () => {
    expect(
      currentPhase(running(), at(TIMELINE.workoutAutoStart + WORKOUT_DURATION + MINUTE)),
    ).toBe("dashboard");
  });
  it("is 'ended' na het harde einde", () => {
    expect(currentPhase(running(), at(TIMELINE.hardEnd))).toBe("ended");
  });
});

describe("elapsedMs met pauze", () => {
  it("telt afgesloten pauzeduur niet mee", () => {
    const s = running({ pausedMs: 2 * MINUTE });
    expect(elapsedMs(s, at(5 * MINUTE))).toBe(3 * MINUTE);
  });
  it("telt de lopende pauze ook niet mee", () => {
    const s = running({ paused: true, pausedAt: at(4 * MINUTE) });
    // Op t=6min: 6 verstreken, maar 2 min lopende pauze → 4 min effectief.
    expect(elapsedMs(s, at(6 * MINUTE))).toBe(4 * MINUTE);
  });
});

describe("remainingMs", () => {
  it("rekent af tot het harde einde", () => {
    expect(remainingMs(running(), at(10 * MINUTE))).toBe(TIMELINE.hardEnd - 10 * MINUTE);
  });
});

describe("workoutElapsedMs met overgeslagen oefeningen", () => {
  it("schuift vooruit met workoutSkipMs", () => {
    const base = running();
    const tWorkout = at(TIMELINE.workoutAutoStart + 10_000); // 10s in de workout
    expect(workoutElapsedMs(base, tWorkout)).toBe(10_000);
    const skipped = running({ workoutSkipMs: 30_000 });
    expect(workoutElapsedMs(skipped, tWorkout)).toBe(40_000);
  });
});
