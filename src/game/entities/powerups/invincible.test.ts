// @ts-nocheck

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { Bird, Pipe, InvinciblePowerUp } from "../../entities/index.js";
import { CONFIG } from "../../systems/index.js";

describe("InvinciblePowerUp", () => {
  let randomSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  it("disables pipe collisions only while active", () => {
    const canvasHeight = 400;
    const gapSize = CONFIG.gapSize;
    const pipe = new Pipe(0, canvasHeight, gapSize);
    const bird = new Bird(0, 0);
    const state = {
      invincibility: { isActive: false, expiresAt: 0 },
      bird,
    };
    const powerUp = new InvinciblePowerUp({ durationMs: 1000 });

    const onCollision = vi.fn();
    const onPass = vi.fn();

    // Baseline: collision occurs when not invincible.
    pipe.update(0, bird, onCollision, onPass);
    expect(onCollision).toHaveBeenCalledTimes(1);

    // Activate the power-up and ensure collisions are ignored.
    powerUp.activate(state, 0);
    powerUp.update(state, 0);

    onCollision.mockClear();
    pipe.update(0, bird, onCollision, onPass, { ignoreCollisions: powerUp.isActive });
    expect(onCollision).not.toHaveBeenCalled();
    expect(state.invincibility.isActive).toBe(true);
    expect(bird.isInvincible).toBe(true);

    // Advance time to force expiration and verify collisions occur again.
    powerUp.update(state, 1500);
    expect(powerUp.isActive).toBe(false);

    pipe.update(0, bird, onCollision, onPass, { ignoreCollisions: powerUp.isActive });
    expect(onCollision).toHaveBeenCalledTimes(1);
    expect(state.invincibility.isActive).toBe(false);
    expect(bird.isInvincible).toBe(false);
  });
});
