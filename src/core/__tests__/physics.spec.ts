import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  PHYSICS,
  clampFlapStrength,
  metersToPixels,
  pixelsToMeters,
} from '../physics';

type MutableEnv = NodeJS.ProcessEnv & Record<string, string | undefined>;

const ORIGINAL_ENV = { ...process.env } as MutableEnv;

describe('physics helpers', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV } as MutableEnv;
    delete process.env.VITE_FF_F05;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV } as MutableEnv;
  });

  describe('clampFlapStrength', () => {
    it('returns the baseline impulse when the feature flag is disabled', () => {
      process.env.VITE_FF_F05 = 'false';

      expect(clampFlapStrength(PHYSICS.flapImpulse)).toBe(PHYSICS.flapImpulse);
      expect(clampFlapStrength(20)).toBe(PHYSICS.flapImpulse);
      expect(clampFlapStrength(Number.NaN)).toBe(PHYSICS.flapImpulse);
    });

    it('clamps the provided strength when the feature flag is enabled', () => {
      process.env.VITE_FF_F05 = 'true';

      expect(clampFlapStrength(3)).toBeCloseTo(4.5);
      expect(clampFlapStrength(9.5)).toBeCloseTo(9.5);
      expect(clampFlapStrength(20)).toBeCloseTo(PHYSICS.terminalVelocity);
    });
  });

  describe('unit conversions', () => {
    it('behaves as a no-op when the feature flag is disabled', () => {
      process.env.VITE_FF_F05 = 'false';

      expect(metersToPixels(5)).toBe(5);
      expect(pixelsToMeters(120)).toBe(120);
      expect(metersToPixels(Number.POSITIVE_INFINITY)).toBe(0);
      expect(pixelsToMeters(Number.NEGATIVE_INFINITY)).toBe(0);
    });

    it('converts meters and pixels when the feature flag is enabled', () => {
      process.env.VITE_FF_F05 = 'true';

      expect(metersToPixels(1)).toBe(PHYSICS.pxPerMeter.scalar);
      expect(metersToPixels(2.5)).toBeCloseTo(2.5 * PHYSICS.pxPerMeter.scalar);
      expect(pixelsToMeters(PHYSICS.pxPerMeter.scalar)).toBeCloseTo(1);
      expect(pixelsToMeters(120)).toBeCloseTo(120 / PHYSICS.pxPerMeter.scalar);
    });
  });
});
