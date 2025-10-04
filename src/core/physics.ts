const TRUE_VALUES = new Set([
  '1',
  'true',
  'yes',
  'on',
  'enable',
  'enabled',
]);

const FALSE_VALUES = new Set([
  '0',
  'false',
  'no',
  'off',
  'disable',
  'disabled',
]);

const FEATURE_FLAG_KEY = 'VITE_FF_F05' as const;
const PIXELS_PER_METER = 48 as const;
const DEFAULT_FLAP_RANGE = Object.freeze({
  min: 4.5,
  max: 13,
});

interface PxPerMeterConversion {
  readonly scalar: number;
  readonly toPixels: (meters: number) => number;
  readonly toMeters: (pixels: number) => number;
}

export interface PhysicsConstants {
  readonly gravity: number;
  readonly flapImpulse: number;
  readonly drag: number;
  readonly terminalVelocity: number;
  readonly pxPerMeter: PxPerMeterConversion;
}

type EnvRecord = Record<string, unknown>;

type ProcessLike = {
  readonly env?: Record<string, unknown>;
};

const readEnvValue = (key: string): unknown => {
  const meta = (import.meta as unknown as { env?: EnvRecord }) ?? {};
  if (meta.env && key in meta.env) {
    return meta.env[key];
  }

  if (typeof process !== 'undefined') {
    const runtime = process as ProcessLike;
    if (runtime.env && key in runtime.env) {
      return runtime.env[key];
    }
  }

  return undefined;
};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === 'string') {
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

const isSettingsFeatureEnabled = (): boolean => {
  const value = readEnvValue(FEATURE_FLAG_KEY);
  const normalized = normalizeBoolean(value);
  return normalized ?? false;
};

const pxPerMeter: PxPerMeterConversion = Object.freeze({
  scalar: PIXELS_PER_METER,
  toPixels: (meters: number) => meters * PIXELS_PER_METER,
  toMeters: (pixels: number) => pixels / PIXELS_PER_METER,
});

export const PHYSICS: PhysicsConstants = Object.freeze({
  gravity: 0.55,
  flapImpulse: 9.5,
  drag: 0.025,
  terminalVelocity: 13,
  pxPerMeter,
});

export const clampFlapStrength = (strength: number): number => {
  if (!Number.isFinite(strength)) {
    return PHYSICS.flapImpulse;
  }

  if (!isSettingsFeatureEnabled()) {
    return PHYSICS.flapImpulse;
  }

  const { min, max } = DEFAULT_FLAP_RANGE;
  return Math.min(Math.max(strength, min), max);
};

export const metersToPixels = (meters: number): number => {
  if (!Number.isFinite(meters)) {
    return 0;
  }

  if (!isSettingsFeatureEnabled()) {
    return meters;
  }

  return PHYSICS.pxPerMeter.toPixels(meters);
};

export const pixelsToMeters = (pixels: number): number => {
  if (!Number.isFinite(pixels)) {
    return 0;
  }

  if (!isSettingsFeatureEnabled()) {
    return pixels;
  }

  return PHYSICS.pxPerMeter.toMeters(pixels);
};

export default PHYSICS;
