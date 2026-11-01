import { describe, expect, it } from "vitest";
import { workoutProgress } from "./workout-engine";
import type { Workout } from "./workouts";

const WORKOUT: Workout = {
  type: "T",
  title: "Test",
  focus: "test",
  exercises: [
    { name: "A", muscleGroup: "m", instructions: "i", seconds: 40, cues: [] },
    { name: "B", muscleGroup: "m", instructions: "i", seconds: 45, cues: [] },
  ],
};

describe("workoutProgress", () => {
  it("start bij de eerste oefening", () => {
    const p = workoutProgress(WORKOUT, 0);
    expect(p.current.name).toBe("A");
    expect(p.next.name).toBe("B");
    expect(p.displayIndex).toBe(1);
    expect(p.total).toBe(2);
    expect(p.secondsLeftInExercise).toBe(40);
  });

  it("schakelt naar de volgende oefening na de eerste", () => {
    const p = workoutProgress(WORKOUT, 41_000); // 41s → in oefening B
    expect(p.current.name).toBe("B");
    expect(p.displayIndex).toBe(2);
    expect(p.secondsLeftInExercise).toBe(44);
  });

  it("herhaalt de oefeningen in lus na één ronde", () => {
    const p = workoutProgress(WORKOUT, 86_000); // na A(40)+B(45)=85s → opnieuw A
    expect(p.current.name).toBe("A");
    expect(p.displayIndex).toBe(1);
  });
});
