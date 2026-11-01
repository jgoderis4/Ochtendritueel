import { describe, expect, it } from "vitest";
import { INITIAL_STATE, SNOOZE_DURATION, TIMELINE, WORKOUT_DURATION } from "./timeline";
import { applyAction } from "./transitions";

const T0 = 1_000_000_000_000;

describe("applyAction", () => {
  it("start zet startedAt en reset de rest", () => {
    const s = applyAction(INITIAL_STATE, { type: "start" }, T0);
    expect(s.startedAt).toBe(T0);
    expect(s.snoozeUntil).toBeNull();
  });

  it("stop reset naar begintoestand", () => {
    const running = { ...INITIAL_STATE, startedAt: T0, workoutSkipMs: 5000 };
    expect(applyAction(running, { type: "stop" }, T0)).toEqual(INITIAL_STATE);
  });

  it("snooze stopt en plant herstart over 10 min", () => {
    const running = { ...INITIAL_STATE, startedAt: T0 };
    const s = applyAction(running, { type: "snooze" }, T0);
    expect(s.startedAt).toBeNull();
    expect(s.snoozeUntil).toBe(T0 + SNOOZE_DURATION);
  });

  it("togglePause pauzeert en hervat met opgebouwde pauzeduur", () => {
    const running = { ...INITIAL_STATE, startedAt: T0 };
    const paused = applyAction(running, { type: "togglePause" }, T0 + 60_000);
    expect(paused.paused).toBe(true);
    expect(paused.pausedAt).toBe(T0 + 60_000);
    const resumed = applyAction(paused, { type: "togglePause" }, T0 + 90_000);
    expect(resumed.paused).toBe(false);
    expect(resumed.pausedAt).toBeNull();
    expect(resumed.pausedMs).toBe(30_000);
  });

  it("skipExercise schuift de workout vooruit (workoutSkipMs > 0)", () => {
    const running = { ...INITIAL_STATE, startedAt: T0 };
    const now = T0 + TIMELINE.workoutAutoStart + 5_000; // midden in oefening 1
    const s = applyAction(running, { type: "skipExercise" }, now);
    expect(s.workoutSkipMs).toBeGreaterThan(0);
  });

  it("negeert acties die een start vereisen wanneer niets loopt", () => {
    expect(applyAction(INITIAL_STATE, { type: "togglePause" }, T0)).toEqual(INITIAL_STATE);
    expect(applyAction(INITIAL_STATE, { type: "skipExercise" }, T0)).toEqual(INITIAL_STATE);
  });

  it("startWorkoutEarly legt de workoutstart op de huidige verstreken tijd", () => {
    const running = { ...INITIAL_STATE, startedAt: T0 };
    const s = applyAction(running, { type: "startWorkoutEarly" }, T0 + 3 * 60_000);
    expect(s.workoutStartOffsetMs).toBe(3 * 60_000);
    expect(s.workoutStartOffsetMs).toBeLessThan(TIMELINE.workoutAutoStart);
    void WORKOUT_DURATION;
  });
});
