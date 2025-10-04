import { describe, expect, it } from "vitest";
import { Pipe } from "../entities/Pipe.js";
import { DeterministicPRNG } from "./prng";

describe("deterministic pipe spawning", () => {
  function spawnSequence(seed: number): number[] {
    const prng = new DeterministicPRNG(seed);
    const heights = [];

    for (let i = 0; i < 10; i += 1) {
      const pipe = new Pipe(0, 400, 120, prng);
      heights.push(pipe.topHeight);
    }

    return heights;
  }

  it("produces identical spawn sequences for identical seeds", () => {
    const firstRun = spawnSequence(123456);
    const secondRun = spawnSequence(123456);

    expect(secondRun).toEqual(firstRun);
  });

  it("produces different spawn sequences for different seeds", () => {
    const firstRun = spawnSequence(42);
    const secondRun = spawnSequence(1337);

    expect(secondRun).not.toEqual(firstRun);
  });
});
