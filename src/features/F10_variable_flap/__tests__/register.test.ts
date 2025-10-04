import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FeatureBus } from "../../bus";
import {
  DEFAULT_AUTO_RELEASE_BUFFER_MS,
  DEFAULT_IGNORE_BELOW_MS,
  DEFAULT_MAX_PRESS_DURATION_MS,
  DEFAULT_MIN_PRESS_DURATION_MS,
  register,
  type VariableImpulseEvent,
} from "../register";
import { F05_MAX_FLAP_IMPULSE, F05_MIN_FLAP_IMPULSE } from "../../F05_settings_context/physics";

const computeExpectedStrength = (duration: number) => {
  const span = DEFAULT_MAX_PRESS_DURATION_MS - DEFAULT_MIN_PRESS_DURATION_MS;
  const normalized = span === 0 ? 1 : (duration - DEFAULT_MIN_PRESS_DURATION_MS) / span;
  return (
    F05_MIN_FLAP_IMPULSE +
    Math.min(Math.max(normalized, 0), 1) * (F05_MAX_FLAP_IMPULSE - F05_MIN_FLAP_IMPULSE)
  );
};

describe("F10 variable flap register", () => {
  let bus: FeatureBus;

  beforeEach(() => {
    bus = new FeatureBus();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing when the feature flag is disabled", () => {
    const impulses: VariableImpulseEvent[] = [];
    bus.on("feature:F10/impulse", (payload) => impulses.push(payload));

    const dispose = register({ env: { VITE_FF_F10: "false" }, bus });

    bus.emit("feature:F09/flap", {
      phase: "start",
      source: "keyboard",
      timestamp: 0,
    });
    bus.emit("feature:F09/flap", {
      phase: "end",
      source: "keyboard",
      timestamp: 200,
    });

    expect(impulses).toHaveLength(0);

    dispose();
  });

  it("scales the impulse between the configured min and max", () => {
    const impulses: VariableImpulseEvent[] = [];
    bus.on("feature:F10/impulse", (payload) => impulses.push(payload));

    const dispose = register({ enabled: true, bus });

    const pressDuration = 220;

    bus.emit("feature:F09/flap", {
      id: "press-1",
      phase: "start",
      source: "pointer",
      timestamp: 0,
    });
    bus.emit("feature:F09/flap", {
      id: "press-1",
      phase: "end",
      source: "pointer",
      timestamp: pressDuration,
    });

    expect(impulses).toHaveLength(1);
    const [impulse] = impulses;
    const expectedStrength = computeExpectedStrength(
      Math.max(DEFAULT_MIN_PRESS_DURATION_MS, Math.min(pressDuration, DEFAULT_MAX_PRESS_DURATION_MS)),
    );
    expect(impulse.strength).toBeCloseTo(expectedStrength, 5);
    expect(impulse.durationMs).toBe(
      Math.max(DEFAULT_MIN_PRESS_DURATION_MS, Math.min(pressDuration, DEFAULT_MAX_PRESS_DURATION_MS)),
    );

    dispose();
  });

  it("clamps impulses below the minimum duration to the minimum strength", () => {
    const impulses: VariableImpulseEvent[] = [];
    bus.on("feature:F10/impulse", (payload) => impulses.push(payload));

    const dispose = register({ enabled: true, bus });

    const duration = DEFAULT_MIN_PRESS_DURATION_MS - 5;

    bus.emit("feature:F09/flap", {
      id: "press-2",
      phase: "start",
      source: "touch",
      timestamp: 0,
    });
    bus.emit("feature:F09/flap", {
      id: "press-2",
      phase: "end",
      source: "touch",
      timestamp: duration,
    });

    expect(impulses).toHaveLength(1);
    const [impulse] = impulses;
    expect(impulse.durationMs).toBe(DEFAULT_MIN_PRESS_DURATION_MS);
    expect(impulse.strength).toBeCloseTo(F05_MIN_FLAP_IMPULSE, 5);

    dispose();
  });

  it("clamps impulses above the maximum duration to the maximum strength", () => {
    const impulses: VariableImpulseEvent[] = [];
    bus.on("feature:F10/impulse", (payload) => impulses.push(payload));

    const dispose = register({ enabled: true, bus });

    const duration = DEFAULT_MAX_PRESS_DURATION_MS + 250;

    bus.emit("feature:F09/flap", {
      id: "press-3",
      phase: "start",
      source: "keyboard",
      timestamp: 0,
    });
    bus.emit("feature:F09/flap", {
      id: "press-3",
      phase: "end",
      source: "keyboard",
      timestamp: duration,
    });

    expect(impulses).toHaveLength(1);
    const [impulse] = impulses;
    expect(impulse.durationMs).toBe(DEFAULT_MAX_PRESS_DURATION_MS);
    expect(impulse.strength).toBeCloseTo(F05_MAX_FLAP_IMPULSE, 5);

    dispose();
  });

  it("ignores micro presses below the configured threshold", () => {
    const impulses: VariableImpulseEvent[] = [];
    bus.on("feature:F10/impulse", (payload) => impulses.push(payload));

    const dispose = register({ enabled: true, bus });

    const duration = DEFAULT_IGNORE_BELOW_MS - 5;

    bus.emit("feature:F09/flap", {
      id: "press-4",
      phase: "start",
      source: "touch",
      timestamp: 0,
    });
    bus.emit("feature:F09/flap", {
      id: "press-4",
      phase: "end",
      source: "touch",
      timestamp: duration,
    });

    expect(impulses).toHaveLength(0);

    dispose();
  });

  it("emits an impulse when a press times out at the maximum duration", () => {
    vi.useFakeTimers();
    const impulses: VariableImpulseEvent[] = [];
    bus.on("feature:F10/impulse", (payload) => impulses.push(payload));

    const dispose = register({ enabled: true, bus });

    bus.emit("feature:F09/flap", {
      id: "press-5",
      phase: "start",
      source: "keyboard",
      timestamp: 0,
    });

    vi.advanceTimersByTime(DEFAULT_MAX_PRESS_DURATION_MS + DEFAULT_AUTO_RELEASE_BUFFER_MS + 5);

    expect(impulses).toHaveLength(1);
    const [impulse] = impulses;
    expect(impulse.durationMs).toBe(DEFAULT_MAX_PRESS_DURATION_MS);
    expect(impulse.strength).toBeCloseTo(F05_MAX_FLAP_IMPULSE, 5);

    dispose();
  });

  it("cleans up timers and listeners on dispose", () => {
    vi.useFakeTimers();
    const impulses: VariableImpulseEvent[] = [];
    bus.on("feature:F10/impulse", (payload) => impulses.push(payload));

    const dispose = register({ enabled: true, bus });

    bus.emit("feature:F09/flap", {
      id: "press-6",
      phase: "start",
      source: "pointer",
      timestamp: 0,
    });

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    dispose();

    expect(vi.getTimerCount()).toBe(0);

    bus.emit("feature:F09/flap", {
      id: "press-6",
      phase: "end",
      source: "pointer",
      timestamp: DEFAULT_MIN_PRESS_DURATION_MS,
    });

    expect(impulses).toHaveLength(0);
  });
});
