import type { FeatureBus } from "../bus";
import type { BirdRigidbodyDefaults } from "../F05_settings_context/constants";

export interface GameTickEventDetail {
  /**
   * Frame counter maintained by the game loop. Optional when unavailable.
   */
  frame?: number;
  /**
   * Total elapsed milliseconds reported by the loop.
   */
  elapsedMs?: number;
  /**
   * Normalized delta used for simulation steps (1 === 60 FPS baseline).
   */
  delta?: number;
  /**
   * Alias for delta provided by older publishers.
   */
  dt?: number;
  /**
   * Total elapsed time reported by the loop in seconds.
   */
  elapsed?: number;
}

export interface GameStateChangeDetail {
  state?: string | null;
  previousState?: string | null;
  to?: string | null;
  from?: string | null;
}

export interface BirdRigidbodyUpdateDetail {
  /**
   * Current vertical position of the bird after the integration step.
   */
  position: number;
  /**
   * Current velocity (units per 60Hz frame) after applying acceleration.
   */
  velocity: number;
  /**
   * Acceleration applied during the step. Mirrors the configured gravity.
   */
  acceleration: number;
  /**
   * Normalized delta used for the step (1 === 60 FPS baseline).
   */
  delta: number;
  /**
   * Milliseconds elapsed for the step. Derived from the tick payload when
   * available and otherwise inferred from the normalized delta.
   */
  elapsedMs: number;
  /**
   * Sequential identifier for the tick when provided by the loop.
   */
  frame: number;
  /**
   * Velocity prior to applying this step's acceleration.
   */
  previousVelocity: number;
  /**
   * Position prior to integrating this frame.
   */
  previousPosition: number;
  /**
   * Terminal velocity cap sourced from the configuration.
   */
  terminalVelocity: number;
}

export type BirdRigidbodyConstants = Pick<
  BirdRigidbodyDefaults,
  "gravity" | "terminalVelocity" | "initialPosition" | "initialVelocity"
>;

type EventBusLike = {
  on<Name extends keyof GameEvents & string>(
    event: Name,
    listener: (payload: GameEvents[Name]) => void,
  ): () => void;
};

export interface RegisterBirdRigidbodyOptions {
  /** Optional override for the core event bus. Primarily used in tests. */
  eventBus?: EventBusLike;
  /** Optional override for the feature bus. */
  featureBus?: FeatureBus;
  /**
   * Configuration overrides applied on top of the F05 defaults and any
   * settings context values.
   */
  constants?: Partial<BirdRigidbodyConstants>;
  /**
   * Allows callers to opt out of automatically subscribing to game ticks.
   * When false, the caller is responsible for toggling via state changes.
   */
  autoStart?: boolean;
}
