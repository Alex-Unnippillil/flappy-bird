import { describe, expect, it, vi } from 'vitest';

import { getLocalizedHints, HINT_KEYS, translate } from '../hud-i18n';
import { createHints } from './Hints';

describe('HUD hints component', () => {
  it('renders localized strings for the provided locale', () => {
    const controller = createHints({ locale: 'es' });
    const { element } = controller;

    const heading = element.querySelector('h2');
    expect(heading?.textContent).toBe(translate('es', 'hud.hints.title'));

    const renderedHints = Array.from(element.querySelectorAll('li')).map((item) => item.textContent);
    const expectedHints = getLocalizedHints('es').hints;

    expect(renderedHints).toEqual(expectedHints);
  });

  it('ensures all defined hint keys resolve in every locale', () => {
    const locales = ['en', 'es', 'fr'] as const;

    for (const locale of locales) {
      for (const key of HINT_KEYS) {
        expect(translate(locale, key)).toMatch(/\w/);
      }
    }
  });

  it('respects the hints toggle visibility state', () => {
    const controller = createHints({ hintsEnabled: false });

    expect(controller.element.hidden).toBe(true);

    controller.setHintsEnabled(true);
    expect(controller.element.hidden).toBe(false);

    controller.setHintsEnabled(false);
    expect(controller.element.hidden).toBe(true);
  });

  it('hides itself when the user prefers reduced motion', () => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    const mediaQueryList = {
      matches: true,
      addEventListener: (_: 'change', listener: (event: MediaQueryListEvent) => void) => {
        listeners.push(listener);
      },
      removeEventListener: vi.fn(),
    };

    const matchMedia = vi.fn().mockReturnValue(mediaQueryList);

    const controller = createHints({ matchMedia });

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(controller.element.hidden).toBe(true);

    mediaQueryList.matches = false;
    listeners.forEach((listener) =>
      listener({ matches: false } as unknown as MediaQueryListEvent),
    );

    expect(controller.element.hidden).toBe(false);

    controller.destroy();
    expect(mediaQueryList.removeEventListener).toHaveBeenCalled();
  });
});
