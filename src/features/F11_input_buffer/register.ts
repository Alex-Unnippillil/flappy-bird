import { getTicker, type Ticker } from "../../core/ticker";
import { featureBus, type FeatureBus } from "../bus";
import type { InputFlapEvent } from "../F06_input_manager/register";

export const FEATURE_FLAG_KEY = "VITE_FF_F11" as const;
export const DEFAULT_BUFFER_WINDOW_MS = 120;
export const DEFAULT_COYOTE_WINDOW_MS = 90;
export const INPUT_IMPULSE_EVENT = "feature:F11/input-buffer:impulse" as const;
export const BIRD_ELIGIBILITY_EVENT = "feature:F11/bird:eligibility" as const;

type BooleanLike = boolean | number | string | null | undefined;

const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enable", "enabled"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", "disable", "disabled"]);

const normalizeBoolean = (value: BooleanLike): boolean | null => {
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
  if (env) {
    const candidate = normalizeBoolean(env[FEATURE_FLAG_KEY] as BooleanLike);
    if (candidate !== null) {
      return candidate;
    }
  }

  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const metaValue = normalizeBoolean(meta.env?.[FEATURE_FLAG_KEY] as BooleanLike);
  if (metaValue !== null) {
    return metaValue;
  }

  if (typeof process !== "undefined" && process?.env) {
    const processValue = normalizeBoolean(
      process.env[FEATURE_FLAG_KEY] as BooleanLike,
    );
    if (processValue !== null) {
      return processValue;
    }
  }

  return false;
};

export interface BirdEligibilityState {
  eligible: boolean;
  grounded: boolean;
}

interface BufferedAttempt {
  event: InputFlapEvent;
  timestamp: number;
  expiresAt: number;
}

export interface BufferedImpulseEvent extends InputFlapEvent {
  attemptedAt: number;
  triggeredAt: number;
  bufferedMs: number;
}

export interface RegisterInputBufferOptions {
  enabled?: boolean;
  env?: Record<string, unknown>;
  bus?: FeatureBus;
  ticker?: Ticker;
  bufferWindowMs?: number;
  coyoteWindowMs?: number;
}

const noop = () => {};

const clampDuration = (value: number, fallback: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return value;
};

export function register(options: RegisterInputBufferOptions = {}): () => void {
  const enabled = options.enabled ?? readFeatureFlag(options.env);
  if (!enabled) {
    return noop;
  }

  const bus = options.bus ?? featureBus;
  const ticker = options.ticker ?? getTicker();
  const bufferWindowMs = clampDuration(
    options.bufferWindowMs ?? DEFAULT_BUFFER_WINDOW_MS,
    DEFAULT_BUFFER_WINDOW_MS,
  );
  const coyoteWindowMs = clampDuration(
    options.coyoteWindowMs ?? DEFAULT_COYOTE_WINDOW_MS,
    DEFAULT_COYOTE_WINDOW_MS,
  );

  const attempts: BufferedAttempt[] = [];
  let eligible = false;
  let grounded = false;
  let lastGroundExitAt: number | null = null;

  const pruneExpired = (now: number) => {
    while (attempts.length > 0) {
      const next = attempts[0];
      if (now <= next.expiresAt) {
        break;
      }
      attempts.shift();
    }
  };

  const emitImpulse = (attempt: BufferedAttempt, triggeredAt: number) => {
    bus.emit(INPUT_IMPULSE_EVENT, {
      source: attempt.event.source,
      originalEvent: attempt.event.originalEvent,
      attemptedAt: attempt.timestamp,
      triggeredAt,
      bufferedMs: Math.max(0, triggeredAt - attempt.timestamp),
    });
  };

  const processQueue = () => {
    const now = ticker.now();
    pruneExpired(now);
    if (attempts.length === 0) {
      return;
    }

    if (!eligible) {
      return;
    }

    const attempt = attempts.shift();
    if (!attempt) {
      return;
    }
    emitImpulse(attempt, now);
  };

  const computeExpiration = (now: number): number => {
    let expiresAt = now + bufferWindowMs;
    if (grounded) {
      expiresAt = Math.max(expiresAt, now + coyoteWindowMs);
    } else if (lastGroundExitAt !== null && now - lastGroundExitAt <= coyoteWindowMs) {
      expiresAt = Math.max(expiresAt, lastGroundExitAt + coyoteWindowMs);
    }
    return expiresAt;
  };

  const handleAttempt = (event: InputFlapEvent) => {
    const now = ticker.now();
    attempts.push({
      event,
      timestamp: now,
      expiresAt: computeExpiration(now),
    });
    processQueue();
  };

  const handleEligibility = (state: BirdEligibilityState) => {
    const now = ticker.now();
    const wasGrounded = grounded;
    grounded = state.grounded;
    eligible = state.eligible;

    if (grounded) {
      lastGroundExitAt = null;
    } else if (wasGrounded && !grounded) {
      lastGroundExitAt = now;
    } else if (lastGroundExitAt !== null && now - lastGroundExitAt > coyoteWindowMs) {
      lastGroundExitAt = null;
    }

    processQueue();
  };

  const disposers: Array<() => void> = [];
  disposers.push(bus.on("feature:F06/input:flap", handleAttempt));
  disposers.push(bus.on(BIRD_ELIGIBILITY_EVENT, handleEligibility));

  return () => {
    while (disposers.length > 0) {
      const dispose = disposers.pop();
      try {
        dispose?.();
      } catch {
        // Ignore teardown errors so all listeners are attempted.
      }
    }
    attempts.length = 0;
  };
}

export default register;
