import { describe, expect, it, vi } from 'vitest';
import { formatScore } from '../formatScore';

describe('formatScore', () => {
  it('formats scores using the provided locale', () => {
    expect(formatScore(1234567, 'de-DE')).toBe('1.234.567');
  });

  it('formats scores using the runtime default locale when none is provided', () => {
    const value = 654321;
    const expected = new Intl.NumberFormat(undefined, {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(value);

    expect(formatScore(value)).toBe(expected);
  });

  it('falls back to manual formatting when the locale is invalid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(formatScore(7654321, 'invalid-locale')).toBe('7,654,321');

    warnSpy.mockRestore();
  });

  it('handles negative and non-finite values gracefully', () => {
    expect(formatScore(-123456, 'en-US')).toBe('-123,456');
    expect(formatScore(Number.NaN, 'en-US')).toBe('0');
    expect(formatScore(Number.POSITIVE_INFINITY, 'en-US')).toBe('0');
  });
});
