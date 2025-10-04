import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { bus } from "@/core/event-bus";
import { featureBus, resetFeatureBus } from "../bus";
import { F05_BIRD_RIGIDBODY_DEFAULTS } from "../F05_settings_context";
import {
  registerF08BirdRigidbody,
  type BirdRigidbodyUpdateDetail,
} from "./index";

const computeBaseline = (deltas: readonly number[]) => {
  const baseline: Array<Pick<BirdRigidbodyUpdateDetail, "position" | "velocity">> = [];
  let velocity = F05_BIRD_RIGIDBODY_DEFAULTS.initialVelocity;
  let position = F05_BIRD_RIGIDBODY_DEFAULTS.initialPosition;

  for (const delta of deltas) {
    velocity = Math.min(
      velocity + F05_BIRD_RIGIDBODY_DEFAULTS.gravity * delta,
      F05_BIRD_RIGIDBODY_DEFAULTS.terminalVelocity,
    );
    position += velocity * delta;
    baseline.push({ position, velocity });
  }

  return baseline;
};

describe("F08 bird rigidbody integrator", () => {
  beforeEach(() => {
    resetFeatureBus();
  });

  afterEach(() => {
    resetFeatureBus();
  });

  const subscribeUpdates = () => {
    const updates: BirdRigidbodyUpdateDetail[] = [];
    const unsubscribe = featureBus.on("feature:F08/bird:update", (payload) => {
      updates.push(payload);
    });
    return { updates, unsubscribe };
  };

  it("integrates position and velocity for unit deltas", () => {
    const cleanup = registerF08BirdRigidbody();
    const { updates, unsubscribe } = subscribeUpdates();

    bus.emit("game:tick", { delta: 1, frame: 1, elapsedMs: 16.6667 });
    bus.emit("game:tick", { delta: 1, frame: 2, elapsedMs: 33.3333 });

    expect(updates).toHaveLength(2);
    expect(updates[0].velocity).toBeCloseTo(0.55, 5);
    expect(updates[0].position).toBeCloseTo(0.55, 5);
    expect(updates[1].velocity).toBeCloseTo(1.1, 5);
    expect(updates[1].position).toBeCloseTo(1.65, 5);

    unsubscribe();
    cleanup();
  });

  it("matches the baseline trajectory for varied deltas", () => {
    const cleanup = registerF08BirdRigidbody({ autoStart: false });
    const { updates, unsubscribe } = subscribeUpdates();

    bus.emit("game:state-change", { state: "running" });

    const deltas = [0.5, 0.25, 0.25, 0.75, 1.5] as const;
    deltas.forEach((delta, index) => {
      bus.emit("game:tick", { delta, frame: index + 1 });
    });

    const baseline = computeBaseline(deltas);

    expect(updates).toHaveLength(deltas.length);
    updates.forEach((update, index) => {
      expect(update.velocity).toBeCloseTo(baseline[index].velocity, 6);
      expect(update.position).toBeCloseTo(baseline[index].position, 6);
    });

    unsubscribe();
    cleanup();
  });

  it("detaches listeners on resets to avoid duplicate integrations", () => {
    const cleanup = registerF08BirdRigidbody();
    const { updates, unsubscribe } = subscribeUpdates();

    bus.emit("game:state-change", { state: "running" });
    bus.emit("game:tick", { delta: 1, frame: 1 });

    expect(updates).toHaveLength(1);

    bus.emit("game:state-change", { state: "running", previousState: "running" });
    bus.emit("game:tick", { delta: 1, frame: 2 });

    expect(updates).toHaveLength(2);

    bus.emit("world:reset");
    bus.emit("game:tick", { delta: 1, frame: 3 });

    expect(updates).toHaveLength(2);

    bus.emit("game:state-change", { state: "running" });
    bus.emit("game:tick", { delta: 1, frame: 4 });

    expect(updates).toHaveLength(3);

    unsubscribe();
    cleanup();
  });
});
