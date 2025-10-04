import { featureBus, type FeatureBus } from "../bus";

const FEATURE_FLAG_KEY = "VITE_FF_F12" as const;
const DEFAULT_MIN_TILT = -0.65;
const DEFAULT_MAX_TILT = 0.75;
const DEFAULT_VELOCITY_NORMALIZER = 9;
const DEFAULT_SMOOTHING_MS = 120;
const DEFAULT_INITIAL_TILT = 0;
const RESET_PHASES = new Set([
  "reset",
  "respawn",
  "respawned",
  "spawn",
  "spawned",
  "intro",
  "ready",
]);

const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enable", "enabled"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", "disable", "disabled"]);

export interface FeatureF08BirdUpdateEvent {
  /**
   * The vertical velocity of the bird in world units per frame. Positive values indicate
   * downward movement, negative values indicate upward movement.
   */
  velocity?: number;
  velocityY?: number;
  verticalVelocity?: number;
  vy?: number;
  /**
   * Duration in milliseconds since the previous update. Used to scale smoothing factors.
   */
  deltaMs?: number;
  elapsedMs?: number;
  /**
   * Optional hint describing the lifecycle state of the bird or world. Certain states reset
   * the tilt controller (e.g., respawning or world reset).
   */
  state?: string;
  phase?: string;
  /**
   * Explicit reset flag forwarded by upstream systems.
   */
  reset?: boolean;
}

export type TiltUpdateReason = "update" | "reset";

export interface FeatureF12TiltEventDetail {
  /** Smoothed pitch angle applied to renderers. */
  angle: number;
  /** Target angle derived from the most recent velocity sample before smoothing. */
  targetAngle: number;
  /** Raw vertical velocity sample used for the update. */
  velocity: number;
  /** Frame delta supplied by the upstream update event. */
  deltaMs: number;
  /**
   * Indicates whether the update was triggered by a world reset or a standard velocity
   * sample.
   */
  reason: TiltUpdateReason;
}

export interface TiltRendererAdapter {
  applyTilt(angle: number, detail: FeatureF12TiltEventDetail): void;
  resetTilt?(): void;
}

export interface RegisterBirdTiltOptions {
  /** Force-enable the feature regardless of environment flags. */
  enabled?: boolean;
  /** Optional environment bag used for testing flag reads. */
  env?: Record<string, unknown>;
  /** Feature bus used for subscribing and emitting events. */
  bus?: FeatureBus;
  /** Optional event target that dispatches `world:reset` events. Defaults to `window`. */
  worldEventTarget?: Pick<EventTarget, "addEventListener" | "removeEventListener"> | null;
  /** Minimum tilt value in radians. */
  minTilt?: number;
  /** Maximum tilt value in radians. */
  maxTilt?: number;
  /** Scaling factor applied to velocity samples before clamping. */
  velocityNormalizer?: number;
  /** Smoothing constant measured in milliseconds. */
  smoothingMs?: number;
  /** Initial tilt applied on registration and resets. */
  initialTilt?: number;
  /** Renderer adapters that should be kept in sync with tilt updates. */
  adapters?: readonly TiltRendererAdapter[];
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return null;
};

const readFeatureFlag = (env?: Record<string, unknown>): boolean => {
  const bag = env ?? (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
  const direct = normalizeBoolean(bag?.[FEATURE_FLAG_KEY]);
  if (direct !== null) {
    return direct;
  }

  if (typeof process !== "undefined" && process.env) {
    const fromProcess = normalizeBoolean(process.env[FEATURE_FLAG_KEY]);
    if (fromProcess !== null) {
      return fromProcess;
    }
  }

  const globalFlags =
    (globalThis as unknown as { __FEATURE_FLAGS__?: Record<string, unknown> }).__FEATURE_FLAGS__ ?? {};
  const fromGlobal = normalizeBoolean(globalFlags[FEATURE_FLAG_KEY]);
  if (fromGlobal !== null) {
    return fromGlobal;
  }

  return false;
};

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const computeAlpha = (deltaMs: number, smoothingMs: number): number => {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
    return 1;
  }
  if (!Number.isFinite(smoothingMs) || smoothingMs <= 0) {
    return 1;
  }
  const clampedDelta = Math.max(0, deltaMs);
  return 1 - Math.exp(-clampedDelta / smoothingMs);
};

const extractVelocity = (event: FeatureF08BirdUpdateEvent): number => {
  const candidates: unknown[] = [
    event.velocityY,
    event.verticalVelocity,
    event.velocity,
    event.vy,
  ];

  for (const candidate of candidates) {
    if (isFiniteNumber(candidate)) {
      return candidate;
    }
  }

  return 0;
};

const extractDelta = (event: FeatureF08BirdUpdateEvent, fallback: number): number => {
  const deltaCandidates: unknown[] = [event.deltaMs, event.elapsedMs];
  for (const candidate of deltaCandidates) {
    if (isFiniteNumber(candidate) && candidate >= 0) {
      return candidate;
    }
  }
  return fallback;
};

const shouldResetFromEvent = (event: FeatureF08BirdUpdateEvent): boolean => {
  if (event.reset === true) {
    return true;
  }

  const phase = typeof event.phase === "string" ? event.phase : event.state;
  if (typeof phase === "string" && RESET_PHASES.has(phase.toLowerCase())) {
    return true;
  }

  return false;
};

const resolveWorldTarget = (
  override?: Pick<EventTarget, "addEventListener" | "removeEventListener"> | null,
): Pick<EventTarget, "addEventListener" | "removeEventListener"> | null => {
  if (override !== undefined) {
    return override;
  }

  if (typeof window !== "undefined") {
    return window;
  }

  return null;
};

export function register(options: RegisterBirdTiltOptions = {}): () => void {
  const enabled = options.enabled ?? readFeatureFlag(options.env);
  if (!enabled) {
    return () => {};
  }

  const bus = options.bus ?? featureBus;
  const adapters = [...(options.adapters ?? [])];
  const minTilt = options.minTilt ?? DEFAULT_MIN_TILT;
  const maxTilt = options.maxTilt ?? DEFAULT_MAX_TILT;
  const velocityNormalizer = options.velocityNormalizer ?? DEFAULT_VELOCITY_NORMALIZER;
  const smoothingMs = options.smoothingMs ?? DEFAULT_SMOOTHING_MS;
  const initialTilt = options.initialTilt ?? DEFAULT_INITIAL_TILT;
  const worldTarget = resolveWorldTarget(options.worldEventTarget);

  let currentAngle = clamp(initialTilt, minTilt, maxTilt);
  let currentTarget = currentAngle;

  const emitTilt = (detail: FeatureF12TiltEventDetail) => {
    for (const adapter of adapters) {
      try {
        adapter.applyTilt(detail.angle, detail);
      } catch (error) {
        if (typeof console !== "undefined" && console?.error) {
          console.error("Failed to apply tilt adapter", error);
        }
      }
    }
    bus.emit("feature:F12/tilt", detail);
  };

  const resetTilt = (reason: TiltUpdateReason = "reset") => {
    currentTarget = clamp(initialTilt, minTilt, maxTilt);
    currentAngle = currentTarget;
    for (const adapter of adapters) {
      adapter.resetTilt?.();
    }
    emitTilt({
      angle: currentAngle,
      targetAngle: currentTarget,
      velocity: 0,
      deltaMs: 0,
      reason,
    });
  };

  const handleBirdUpdate = (event: FeatureF08BirdUpdateEvent) => {
    if (shouldResetFromEvent(event)) {
      resetTilt("reset");
      return;
    }

    const velocity = extractVelocity(event);
    const deltaMs = extractDelta(event, 16.67);
    const normalized = velocityNormalizer === 0 ? velocity : velocity / velocityNormalizer;
    const targetAngle = clamp(normalized, minTilt, maxTilt);
    currentTarget = targetAngle;

    const alpha = computeAlpha(deltaMs, smoothingMs);
    currentAngle += (targetAngle - currentAngle) * alpha;

    emitTilt({
      angle: currentAngle,
      targetAngle,
      velocity,
      deltaMs,
      reason: "update",
    });
  };

  const cleanupTasks = new Set<() => void>();

  const unsubscribeUpdate = bus.on("feature:F08/bird:update", handleBirdUpdate);
  cleanupTasks.add(unsubscribeUpdate);

  if (worldTarget && typeof worldTarget.addEventListener === "function") {
    const handler = () => {
      resetTilt("reset");
    };
    worldTarget.addEventListener("world:reset", handler as EventListener);
    cleanupTasks.add(() => {
      worldTarget.removeEventListener("world:reset", handler as EventListener);
    });
  }

  // Emit initial tilt so subscribers start from a known value.
  emitTilt({
    angle: currentAngle,
    targetAngle: currentTarget,
    velocity: 0,
    deltaMs: 0,
    reason: "reset",
  });

  return () => {
    for (const task of cleanupTasks) {
      try {
        task();
      } catch (error) {
        if (typeof console !== "undefined" && console?.error) {
          console.error("Failed to cleanup bird tilt registration", error);
        }
      }
    }
    cleanupTasks.clear();
  };
}

export default register;
