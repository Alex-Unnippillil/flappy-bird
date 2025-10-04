import { beforeEach, describe, expect, it } from "vitest";

import { DeterministicPRNG } from "@/game/systems/prng";
import { featureBus, FeatureBus, resetFeatureBus } from "../../bus";
import type { InputFlapEvent } from "../../F06_input_manager/register";
import {
  BIRD_ELIGIBILITY_EVENT,
  DEFAULT_BUFFER_WINDOW_MS,
  DEFAULT_COYOTE_WINDOW_MS,
  INPUT_IMPULSE_EVENT,
  register,
  type BirdEligibilityState,
  type BufferedImpulseEvent,
  type RegisterInputBufferOptions,
} from "../register";
import type { Ticker } from "@/core/ticker";

class ManualTicker implements Ticker {
  private current = 0;

  now(): number {
    return this.current;
  }

  advance(ms: number): number {
    this.current += ms;
    return this.current;
  }

  set(time: number): void {
    this.current = time;
  }
}

const createAttempt = (): InputFlapEvent => ({
  source: "keyboard",
  originalEvent: new Event("flap"),
});

const emitEligibility = (bus: FeatureBus, state: BirdEligibilityState): void => {
  bus.emit(BIRD_ELIGIBILITY_EVENT, state);
};

const registerWithOptions = (options: RegisterInputBufferOptions = {}) =>
  register({ enabled: true, ...options });

describe("F11 input buffer register", () => {
  beforeEach(() => {
    resetFeatureBus();
  });

  it("buffers flap attempts triggered just before eligibility", () => {
    const ticker = new ManualTicker();
    const impulses: BufferedImpulseEvent[] = [];

    const cleanup = registerWithOptions({ ticker });
    const unsubscribe = featureBus.on(INPUT_IMPULSE_EVENT, (payload) => {
      impulses.push(payload);
    });

    emitEligibility(featureBus, { grounded: true, eligible: false });

    ticker.advance(20);
    featureBus.emit("feature:F06/input:flap", createAttempt());

    expect(impulses).toHaveLength(0);

    ticker.advance(10);
    emitEligibility(featureBus, { grounded: false, eligible: true });

    expect(impulses).toHaveLength(1);
    expect(impulses[0]).toMatchObject({
      attemptedAt: 20,
      triggeredAt: 30,
      bufferedMs: 10,
    });

    unsubscribe();
    cleanup();
  });

  it("extends ground attempts through the coyote window", () => {
    const ticker = new ManualTicker();
    const impulses: BufferedImpulseEvent[] = [];
    const bufferWindowMs = 40;
    const coyoteWindowMs = 120;

    const cleanup = registerWithOptions({
      ticker,
      bufferWindowMs,
      coyoteWindowMs,
    });
    const unsubscribe = featureBus.on(INPUT_IMPULSE_EVENT, (payload) => {
      impulses.push(payload);
    });

    emitEligibility(featureBus, { grounded: true, eligible: false });

    ticker.advance(10);
    featureBus.emit("feature:F06/input:flap", createAttempt());

    ticker.advance(20);
    emitEligibility(featureBus, { grounded: false, eligible: false });

    ticker.advance(100);
    emitEligibility(featureBus, { grounded: false, eligible: true });

    expect(impulses).toHaveLength(1);
    expect(impulses[0].triggeredAt).toBe(130);
    expect(impulses[0].attemptedAt).toBe(10);

    unsubscribe();
    cleanup();
  });

  it("produces deterministic results across seeds", () => {
    const runSimulation = (seed: number) => {
      const bus = new FeatureBus();
      const ticker = new ManualTicker();
      const impulses: Array<Pick<BufferedImpulseEvent, "attemptedAt" | "triggeredAt">> = [];
      const prng = new DeterministicPRNG(seed);

      const cleanup = registerWithOptions({ bus, ticker });
      const unsubscribe = bus.on(INPUT_IMPULSE_EVENT, (payload) => {
        impulses.push({
          attemptedAt: payload.attemptedAt,
          triggeredAt: payload.triggeredAt,
        });
      });

      bus.emit(BIRD_ELIGIBILITY_EVENT, { grounded: true, eligible: false });

      for (let i = 0; i < 5; i += 1) {
        ticker.advance(Math.floor(prng.next() * DEFAULT_BUFFER_WINDOW_MS));
        bus.emit("feature:F06/input:flap", createAttempt());

        ticker.advance(Math.floor(prng.next() * DEFAULT_COYOTE_WINDOW_MS));
        bus.emit(BIRD_ELIGIBILITY_EVENT, { grounded: false, eligible: true });
        ticker.advance(1);
        bus.emit(BIRD_ELIGIBILITY_EVENT, { grounded: false, eligible: false });
      }

      unsubscribe();
      cleanup();
      return impulses;
    };

    const seeds = [1, 42, 12345];
    for (const seed of seeds) {
      const first = runSimulation(seed);
      const second = runSimulation(seed);
      expect(second).toEqual(first);
    }
  });
});
