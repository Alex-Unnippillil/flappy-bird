import { featureBus, type FeatureBus } from "../bus";
import { F05_MAX_FLAP_IMPULSE, F05_MIN_FLAP_IMPULSE } from "../F05_settings_context/physics";
import type { InputSource } from "../F06_input_manager/register";

export type FlapPhase = "start" | "end" | "cancel";

export interface FlapPressEvent {
  id?: string | number;
  phase: FlapPhase;
  source: InputSource;
  timestamp?: number;
}

export interface VariableImpulseEvent {
  strength: number;
  durationMs: number;
  rawDurationMs: number;
  smoothedDurationMs: number;
  source: InputSource;
}

export interface RegisterVariableFlapOptions {
  enabled?: boolean;
  env?: Record<string, unknown>;
  bus?: FeatureBus;
  minPressDurationMs?: number;
  maxPressDurationMs?: number;
  ignoreBelowMs?: number;
  smoothingAlpha?: number;
  autoReleaseBufferMs?: number;
  now?: () => number;
}

const FEATURE_FLAG_KEY = "VITE_FF_F10" as const;

export const DEFAULT_MIN_PRESS_DURATION_MS = 60;
export const DEFAULT_MAX_PRESS_DURATION_MS = 360;
export const DEFAULT_IGNORE_BELOW_MS = 40;
export const DEFAULT_SMOOTHING_ALPHA = 0.35;
export const DEFAULT_AUTO_RELEASE_BUFFER_MS = 32;

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const clamp01 = (value: number): number => clamp(value, 0, 1);

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
    if (["1", "true", "yes", "on", "enable", "enabled"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "off", "disable", "disabled"].includes(normalized)) {
      return false;
    }
  }
  return null;
};

const resolveEnv = (
  env?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (env) {
    return env;
  }
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  return meta.env;
};

const resolveEnabled = (options: RegisterVariableFlapOptions): boolean => {
  if (typeof options.enabled === "boolean") {
    return options.enabled;
  }
  const env = resolveEnv(options.env) ?? {};
  const normalized = normalizeBoolean(env[FEATURE_FLAG_KEY]);
  return normalized ?? false;
};

type TimerHandle = ReturnType<typeof setTimeout> | null;

type ActivePress = {
  start: number;
  source: InputSource;
  timerId: TimerHandle;
};

const resolveTimestamp = (timestamp: number | undefined, now: () => number): number => {
  if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
    return timestamp;
  }
  return now();
};

export function register(options: RegisterVariableFlapOptions = {}): () => void {
  if (!resolveEnabled(options)) {
    return () => {};
  }

  const bus = options.bus ?? featureBus;
  const now = options.now ?? (() => (typeof performance !== "undefined" ? performance.now() : Date.now()));

  const minDuration = Math.max(0, options.minPressDurationMs ?? DEFAULT_MIN_PRESS_DURATION_MS);
  const maxDuration = Math.max(minDuration, options.maxPressDurationMs ?? DEFAULT_MAX_PRESS_DURATION_MS);
  const ignoreBelow = clamp(
    options.ignoreBelowMs ?? DEFAULT_IGNORE_BELOW_MS,
    0,
    minDuration,
  );
  const smoothingAlpha = clamp01(options.smoothingAlpha ?? DEFAULT_SMOOTHING_ALPHA);
  const autoReleaseBufferMs = Math.max(0, options.autoReleaseBufferMs ?? DEFAULT_AUTO_RELEASE_BUFFER_MS);

  const impulseMin = Math.min(F05_MIN_FLAP_IMPULSE, F05_MAX_FLAP_IMPULSE);
  const impulseMax = Math.max(F05_MIN_FLAP_IMPULSE, F05_MAX_FLAP_IMPULSE);

  const activePresses = new Map<string | number, ActivePress>();
  let smoothedDuration: number | null = null;
  let disposed = false;

  const cleanupPress = (key: string | number, press: ActivePress | undefined) => {
    if (!press) {
      return;
    }
    if (press.timerId !== null) {
      clearTimeout(press.timerId);
    }
    activePresses.delete(key);
  };

  const emitImpulse = (
    press: ActivePress,
    rawDurationMs: number,
  ) => {
    if (rawDurationMs < ignoreBelow) {
      return;
    }

    const clampedDuration = clamp(rawDurationMs, minDuration, maxDuration);
    if (smoothedDuration === null) {
      smoothedDuration = clampedDuration;
    } else {
      smoothedDuration += (clampedDuration - smoothedDuration) * smoothingAlpha;
    }

    const span = maxDuration - minDuration;
    const normalizedDuration = span === 0 ? 1 : clamp01((smoothedDuration - minDuration) / span);
    const spanImpulse = impulseMax - impulseMin;
    const strength = clamp(impulseMin + spanImpulse * normalizedDuration, impulseMin, impulseMax);

    bus.emit("feature:F10/impulse", {
      strength,
      durationMs: clampedDuration,
      rawDurationMs,
      smoothedDurationMs: smoothedDuration,
      source: press.source,
    });
  };

  const finalizePress = (
    key: string | number,
    press: ActivePress | undefined,
    endTimestamp: number,
    reason: "release" | "cancel" | "timeout",
  ) => {
    if (!press) {
      return;
    }

    cleanupPress(key, press);

    if (reason === "cancel") {
      return;
    }

    const rawDurationMs = Math.max(0, endTimestamp - press.start);
    emitImpulse(press, rawDurationMs);
  };

  const scheduleAutoRelease = (key: string | number, press: ActivePress) => {
    const delay = maxDuration + autoReleaseBufferMs;
    press.timerId = setTimeout(() => {
      if (disposed) {
        return;
      }
      finalizePress(key, press, press.start + maxDuration, "timeout");
    }, delay);
  };

  const handleFlap = (event: FlapPressEvent) => {
    if (disposed) {
      return;
    }

    const key = event.id ?? event.source;
    const press = activePresses.get(key);
    const timestamp = resolveTimestamp(event.timestamp, now);

    if (event.phase === "start") {
      if (press) {
        finalizePress(key, press, timestamp, "cancel");
      }
      const nextPress: ActivePress = {
        start: timestamp,
        source: event.source,
        timerId: null,
      };
      activePresses.set(key, nextPress);
      scheduleAutoRelease(key, nextPress);
      return;
    }

    if (!press) {
      return;
    }

    if (event.phase === "end") {
      finalizePress(key, press, timestamp, "release");
      return;
    }

    if (event.phase === "cancel") {
      finalizePress(key, press, timestamp, "cancel");
    }
  };

  const unsubscribe = bus.on("feature:F09/flap", handleFlap);

  return () => {
    if (disposed) {
      return;
    }
    disposed = true;
    unsubscribe();
    activePresses.forEach((press, key) => {
      cleanupPress(key, press);
    });
    activePresses.clear();
  };
}

export default register;
