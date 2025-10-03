import { describe, expect, it } from "vitest";
import {
  difficultyMilestones,
  getDifficulty,
  getGapSize,
  getPipeSpeed,
  getSpawnInterval,
} from "../src/game/systems/difficulty";

describe("difficulty milestones", () => {
  it("exposes documented milestone values", () => {
    expect(difficultyMilestones).toMatchObject([
      { score: 0, pipeSpeed: 2, gapSize: 100, spawnInterval: 120 },
      { score: 20, pipeSpeed: 2.5, gapSize: 95, spawnInterval: 110 },
      { score: 50, pipeSpeed: 3.2, gapSize: 90, spawnInterval: 100 },
      { score: 100, pipeSpeed: 4, gapSize: 85, spawnInterval: 90 },
      { score: 200, pipeSpeed: 5, gapSize: 80, spawnInterval: 80 },
    ]);
  });
});

describe("difficulty calculations", () => {
  it("returns the baseline metrics for the opening score band", () => {
    const metrics = getDifficulty(0, 0);
    expect(metrics).toEqual({ pipeSpeed: 2, gapSize: 100, spawnInterval: 120 });
  });

  it("uses the highest milestone not exceeding the score", () => {
    const metrics = getDifficulty(120, 0);
    expect(metrics).toEqual({ pipeSpeed: 4, gapSize: 85, spawnInterval: 90 });
  });

  it("increases challenge over time", () => {
    const ninetySeconds = 90; // three time buckets
    expect(getPipeSpeed(0, ninetySeconds)).toBeCloseTo(2 + 0.15, 5);
    expect(getGapSize(0, ninetySeconds)).toBeLessThan(100);
    expect(getSpawnInterval(0, ninetySeconds)).toBeLessThan(120);
  });

  it("caps time-based adjustments", () => {
    const longSessionSeconds = 60 * 10; // beyond cap
    const gap = getGapSize(0, longSessionSeconds);
    const interval = getSpawnInterval(0, longSessionSeconds);
    expect(gap).toBeGreaterThanOrEqual(70);
    expect(interval).toBeGreaterThanOrEqual(70);
  });
});
