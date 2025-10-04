import { describe, expect, it } from 'vitest';

import { getHudString } from '../hud-i18n';

describe('getHudString', () => {
  it('enforces valid HUD string keys at compile time', () => {
    // @ts-expect-error - invalid key should not compile
    getHudString('invalid-key', 'en');

    // sanity assertion so the test has runtime expectations
    expect(getHudString('scoreLabel', 'en')).toBe('Score');
  });

  it('returns English strings by default', () => {
    expect(getHudString('tapToStart')).toBe('Tap to start');
  });

  it('selects localized strings for the provided locale', () => {
    expect(getHudString('tapToStart', 'fr')).toBe('Touchez pour commencer');
  });

  it('normalizes locale subtags when looking up dictionaries', () => {
    expect(getHudString('bestLabel', 'fr-CA')).toBe('Record');
  });

  it('falls back to English for unsupported locales', () => {
    expect(getHudString('scoreLabel', 'de')).toBe('Score');
  });
});
