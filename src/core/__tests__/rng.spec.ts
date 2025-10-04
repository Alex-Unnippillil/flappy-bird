import { describe, expect, it, vi } from "vitest";
import { createRng } from "../rng";

describe("createRng", () => {
  it("produces identical sequences for identical seeds", () => {
    const seed = "2024-05-04T00:00:00.000Z";
    const first = createRng(seed);
    const second = createRng(seed);

    const firstSequence = Array.from({ length: 6 }, () => first.nextFloat());
    const secondSequence = Array.from({ length: 6 }, () => second.nextFloat());

    expect(secondSequence).toEqual(firstSequence);
  });

  it("treats int bounds as inclusive", () => {
    const rng = createRng("bounds-test-seed");
    const results = [rng.int(1, 3), rng.int(1, 3), rng.int(1, 3), rng.int(1, 3)];

    for (const value of results) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(3);
    }

    expect(results).toContain(1);
    expect(results).toContain(3);
  });

  it("persists ISO seeds when none are provided", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem">;

    const now = vi.fn(() => new Date("2024-05-04T12:34:56.000Z"));

    const rng = createRng(undefined, { storage, now });

    expect(rng.getSeed()).toBe("2024-05-04T12:34:56.000Z");
    expect(storage.setItem).toHaveBeenCalledWith("flappy.seed", "2024-05-04T12:34:56.000Z");

    const sameStorage = {
      getItem: vi.fn().mockReturnValue("stored-seed"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem">;

    const reused = createRng(undefined, { storage: sameStorage });
    expect(reused.getSeed()).toBe("stored-seed");
    expect(sameStorage.setItem).toHaveBeenCalledWith("flappy.seed", "stored-seed");
  });
});
