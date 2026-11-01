import { describe, expect, it } from "vitest";
import { WORLD_CITIES, wmoToText } from "./world-cities";

describe("wmoToText", () => {
  it("mapt bekende WMO-codes naar NL-omschrijvingen", () => {
    expect(wmoToText(0).text).toBe("Helder");
    expect(wmoToText(3).text).toBe("Bewolkt");
    expect(wmoToText(45).text).toBe("Mist");
    expect(wmoToText(63).text).toBe("Regen");
    expect(wmoToText(71).text).toBe("Sneeuw");
    expect(wmoToText(95).text).toBe("Onweer");
  });
  it("geeft altijd een symbool terug", () => {
    for (const code of [0, 2, 48, 55, 65, 77, 82, 86, 99]) {
      expect(wmoToText(code).emoji.length).toBeGreaterThan(0);
    }
  });
});

describe("WORLD_CITIES", () => {
  it("heeft geldige coördinaten", () => {
    expect(WORLD_CITIES.length).toBeGreaterThan(0);
    for (const c of WORLD_CITIES) {
      expect(c.lat).toBeGreaterThanOrEqual(-90);
      expect(c.lat).toBeLessThanOrEqual(90);
      expect(c.lon).toBeGreaterThanOrEqual(-180);
      expect(c.lon).toBeLessThanOrEqual(180);
      expect(c.name).toBeTruthy();
    }
  });
});
