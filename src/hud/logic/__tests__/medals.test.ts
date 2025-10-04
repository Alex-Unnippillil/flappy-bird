import { describe, expect, it } from "vitest";
import { getMedalForScore, Medal } from "../medals";

describe("getMedalForScore", () => {
  const cases: Array<{ score: number; medal: Medal }> = [
    { score: -10, medal: Medal.None },
    { score: 0, medal: Medal.None },
    { score: 9, medal: Medal.None },
    { score: 10, medal: Medal.Bronze },
    { score: 15, medal: Medal.Bronze },
    { score: 19, medal: Medal.Bronze },
    { score: 20, medal: Medal.Silver },
    { score: 25, medal: Medal.Silver },
    { score: 29, medal: Medal.Silver },
    { score: 30, medal: Medal.Gold },
    { score: 35, medal: Medal.Gold },
    { score: 39, medal: Medal.Gold },
    { score: 40, medal: Medal.Platinum },
    { score: 100, medal: Medal.Platinum },
  ];

  for (const { score, medal } of cases) {
    it(`returns ${medal} for a score of ${score}`, () => {
      expect(getMedalForScore(score)).toBe(medal);
    });
  }

  it("treats fractional scores by flooring them", () => {
    expect(getMedalForScore(29.9)).toBe(Medal.Silver);
    expect(getMedalForScore(30.2)).toBe(Medal.Gold);
  });

  it("returns none for non-finite values", () => {
    expect(getMedalForScore(Number.POSITIVE_INFINITY)).toBe(Medal.None);
    expect(getMedalForScore(Number.NEGATIVE_INFINITY)).toBe(Medal.None);
    expect(getMedalForScore(Number.NaN)).toBe(Medal.None);
  });

  it("is pure and does not retain state between invocations", () => {
    expect(getMedalForScore(10)).toBe(Medal.Bronze);
    expect(getMedalForScore(0)).toBe(Medal.None);
    expect(getMedalForScore(10)).toBe(Medal.Bronze);
  });
});
