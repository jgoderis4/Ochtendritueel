import { describe, expect, it } from "vitest";
import { factsForDay, FACTS } from "./facts";

const DAY = 86_400_000;

describe("factsForDay", () => {
  it("geeft standaard 3 verschillende weetjes", () => {
    const f = factsForDay(10 * DAY);
    expect(f).toHaveLength(3);
    expect(new Set(f).size).toBe(3);
  });
  it("is deterministisch per dag", () => {
    expect(factsForDay(5 * DAY)).toEqual(factsForDay(5 * DAY + 1000));
  });
  it("wisselt van dag tot dag", () => {
    expect(factsForDay(5 * DAY)).not.toEqual(factsForDay(6 * DAY));
  });
  it("komen alle weetjes uit de pool", () => {
    for (const f of factsForDay(3 * DAY)) expect(FACTS).toContain(f);
  });
});
