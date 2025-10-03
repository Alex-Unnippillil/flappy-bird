import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../../events/event-bus";
import {
  PowerupSpawnSystem,
  PowerupDefinition,
  PowerupEvents,
  RandomGenerator,
} from "../powerup-spawn";

class SequencePrng implements RandomGenerator {
  private index = 0;

  constructor(private readonly sequence: number[]) {}

  next(): number {
    if (this.sequence.length === 0) {
      return 0;
    }

    const value = this.sequence[this.index % this.sequence.length];
    this.index += 1;
    return value;
  }
}

function createSystem(options: {
  powerups?: PowerupDefinition[];
  minSpacing?: number;
  maxSpacing?: number;
  prng?: RandomGenerator;
  eventBus?: EventBus<PowerupEvents>;
}) {
  const eventBus = options.eventBus ?? new EventBus<PowerupEvents>();
  const prng = options.prng ?? { next: () => 1 };
  const powerups =
    options.powerups ?? ([{ id: "speed", weight: 1 }] as PowerupDefinition[]);

  return {
    eventBus,
    system: new PowerupSpawnSystem({
      powerups,
      minSpacing: options.minSpacing ?? 5,
      maxSpacing: options.maxSpacing ?? 10,
      prng,
      eventBus,
    }),
  };
}

describe("PowerupSpawnSystem spacing", () => {
  it("does not spawn before the minimum spacing", () => {
    const { system, eventBus } = createSystem({
      minSpacing: 5,
      maxSpacing: 10,
      prng: { next: () => 1 },
    });

    const emitSpy = vi.spyOn(eventBus, "emit");

    for (let i = 0; i < 4; i += 1) {
      expect(system.update(1)).toBeNull();
    }

    expect(emitSpy).not.toHaveBeenCalled();

    expect(system.update(1)).toBeNull();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("forces a spawn by the maximum spacing", () => {
    const { system, eventBus } = createSystem({
      minSpacing: 3,
      maxSpacing: 6,
      prng: { next: () => 1 },
    });
    const emitSpy = vi.spyOn(eventBus, "emit");

    // After 6 units we must spawn even though the PRNG would reject earlier attempts.
    system.update(6);

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy.mock.calls[0][0]).toMatchObject({
      type: "powerup:available",
      powerupId: "speed",
    });
  });
});

describe("PowerupSpawnSystem weighted selection", () => {
  it("picks power-ups using the configured weights", () => {
    const powerups: PowerupDefinition[] = [
      { id: "speed", weight: 1 },
      { id: "shield", weight: 3 },
    ];
    const prng = new SequencePrng([0, 0.3, 0.9]);
    const { system, eventBus } = createSystem({
      powerups,
      minSpacing: 0,
      maxSpacing: 0,
      prng,
    });
    const emitSpy = vi.spyOn(eventBus, "emit");

    system.update(0);
    system.update(0);
    system.update(0);

    expect(emitSpy).toHaveBeenCalledTimes(3);
    const ids = emitSpy.mock.calls.map((call) => call[0].powerupId);
    expect(ids).toEqual(["speed", "shield", "shield"]);
  });
});
