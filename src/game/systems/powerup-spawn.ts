import { EventBus, EventOf } from "../events/event-bus";

export interface RandomGenerator {
  next(): number;
}

export interface PowerupDefinition {
  id: string;
  weight: number;
}

export interface PowerupAvailablePayload {
  powerupId: string;
}

export interface PowerupEvents {
  "powerup:available": PowerupAvailablePayload;
}

export type PowerupAvailableEvent = EventOf<PowerupEvents, "powerup:available">;

export interface PowerupSpawnOptions {
  powerups: PowerupDefinition[];
  minSpacing: number;
  maxSpacing: number;
  prng: RandomGenerator;
  eventBus: EventBus<PowerupEvents>;
}

interface WeightedPowerup {
  id: string;
  cumulativeWeight: number;
}

export class PowerupSpawnSystem {
  private readonly powerups: WeightedPowerup[];
  private readonly totalWeight: number;
  private readonly minSpacing: number;
  private readonly maxSpacing: number;
  private readonly prng: RandomGenerator;
  private readonly eventBus: EventBus<PowerupEvents>;
  private distanceSinceLastSpawn = 0;

  constructor(options: PowerupSpawnOptions) {
    if (options.powerups.length === 0) {
      throw new Error("At least one power-up must be provided");
    }

    if (options.minSpacing < 0 || options.maxSpacing < 0) {
      throw new Error("Spacing values must be non-negative");
    }

    if (options.maxSpacing < options.minSpacing) {
      throw new Error("maxSpacing must be greater than or equal to minSpacing");
    }

    this.minSpacing = options.minSpacing;
    this.maxSpacing = options.maxSpacing;
    this.prng = options.prng;
    this.eventBus = options.eventBus;

    let runningTotal = 0;
    this.powerups = options.powerups.map((powerup) => {
      if (powerup.weight <= 0) {
        throw new Error("Power-up weights must be greater than zero");
      }

      runningTotal += powerup.weight;
      return {
        id: powerup.id,
        cumulativeWeight: runningTotal,
      } satisfies WeightedPowerup;
    });

    this.totalWeight = runningTotal;
  }

  reset(): void {
    this.distanceSinceLastSpawn = 0;
  }

  update(distanceTravelled: number): PowerupAvailableEvent | null {
    if (distanceTravelled < 0) {
      throw new Error("Distance travelled must be non-negative");
    }

    this.distanceSinceLastSpawn += distanceTravelled;

    if (this.distanceSinceLastSpawn < this.minSpacing) {
      return null;
    }

    const spacingRange = this.maxSpacing - this.minSpacing;
    let shouldSpawn = false;

    if (spacingRange <= 0) {
      shouldSpawn = true;
    } else if (this.distanceSinceLastSpawn >= this.maxSpacing) {
      shouldSpawn = true;
    } else {
      const progress = (this.distanceSinceLastSpawn - this.minSpacing) / spacingRange;
      const threshold = Math.min(Math.max(progress, 0), 1);
      shouldSpawn = this.prng.next() <= threshold;
    }

    if (!shouldSpawn) {
      return null;
    }

    const powerupId = this.selectPowerup();
    this.distanceSinceLastSpawn = 0;
    const event: PowerupAvailableEvent = {
      type: "powerup:available",
      powerupId,
    };
    this.eventBus.emit(event);
    return event;
  }

  private selectPowerup(): string {
    const roll = Math.max(0, this.prng.next()) * this.totalWeight;

    for (const powerup of this.powerups) {
      if (roll < powerup.cumulativeWeight) {
        return powerup.id;
      }
    }

    return this.powerups[this.powerups.length - 1]?.id;
  }
}
