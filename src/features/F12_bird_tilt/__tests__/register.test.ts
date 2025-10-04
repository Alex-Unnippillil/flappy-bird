import { afterEach, describe, expect, it, vi } from "vitest";

import { featureBus, resetFeatureBus } from "../../bus";
import register, {
  type FeatureF12TiltEventDetail,
  type TiltRendererAdapter,
} from "../register";

describe("F12 bird tilt feature", () => {
  afterEach(() => {
    resetFeatureBus();
    vi.restoreAllMocks();
  });

  it("returns a noop disposer when disabled", () => {
    const handler = vi.fn();
    featureBus.on("feature:F12/tilt", handler);

    const dispose = register({ enabled: false, bus: featureBus });
    expect(typeof dispose).toBe("function");

    featureBus.emit("feature:F08/bird:update", { velocity: 5, deltaMs: 16 });
    expect(handler).not.toHaveBeenCalled();
  });

  it("emits smoothed tilt updates in response to velocity samples", () => {
    const events: FeatureF12TiltEventDetail[] = [];
    const adapter: TiltRendererAdapter = {
      applyTilt: (_angle, detail) => {
        events.push(detail);
      },
    };

    register({
      enabled: true,
      bus: featureBus,
      smoothingMs: 120,
      velocityNormalizer: 9,
      adapters: [adapter],
    });

    featureBus.emit("feature:F08/bird:update", { velocity: 6, deltaMs: 16 });

    expect(events).toHaveLength(2); // initial reset + update
    const [, update] = events;
    const expectedTarget = 6 / 9;
    const expectedAlpha = 1 - Math.exp(-16 / 120);
    const expectedAngle = expectedTarget * expectedAlpha;

    expect(update.reason).toBe("update");
    expect(update.targetAngle).toBeCloseTo(expectedTarget, 5);
    expect(update.angle).toBeCloseTo(expectedAngle, 5);
  });

  it("clamps tilt to configured bounds", () => {
    const events: FeatureF12TiltEventDetail[] = [];
    register({
      enabled: true,
      bus: featureBus,
      minTilt: -0.5,
      maxTilt: 0.5,
      adapters: [
        {
          applyTilt: (_angle, detail) => {
            events.push(detail);
          },
        },
      ],
    });

    featureBus.emit("feature:F08/bird:update", { velocity: 50, deltaMs: 16 });

    const [, update] = events;
    expect(update.targetAngle).toBe(0.5);
    expect(update.angle).toBeLessThanOrEqual(0.5);
  });

  it("resets tilt on world reset events", () => {
    const events: FeatureF12TiltEventDetail[] = [];
    const worldTarget = new EventTarget();

    register({
      enabled: true,
      bus: featureBus,
      worldEventTarget: worldTarget,
      adapters: [
        {
          applyTilt: (_angle, detail) => {
            events.push(detail);
          },
        },
      ],
    });

    featureBus.emit("feature:F08/bird:update", { velocity: 6, deltaMs: 16 });
    worldTarget.dispatchEvent(new Event("world:reset"));

    expect(events).toHaveLength(3);
    const resetEvent = events[events.length - 1];
    expect(resetEvent.reason).toBe("reset");
    expect(resetEvent.angle).toBe(0);
    expect(resetEvent.targetAngle).toBe(0);
  });

  it("cleans up listeners on dispose", () => {
    const handler = vi.fn();
    featureBus.on("feature:F12/tilt", handler);

    const dispose = register({ enabled: true, bus: featureBus });
    dispose();

    featureBus.emit("feature:F08/bird:update", { velocity: -4, deltaMs: 16 });
    expect(handler).toHaveBeenCalledTimes(1); // initial reset emission only
  });
});
