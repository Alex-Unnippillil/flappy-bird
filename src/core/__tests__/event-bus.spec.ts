import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { bus } from '../event-bus';
import { emit, off, on } from '../events';
import type { GameEventName } from '../events';

declare global {
  interface GameEvents {
    'core:test': { value: number };
    'core:ping': undefined;
  }
}

describe('event bus', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_FF_F02', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('delivers payloads to subscribed listeners', () => {
    const handler = vi.fn<[payload: { value: number }], void>();
    const unsubscribe = bus.on('core:test', handler);

    bus.emit('core:test', { value: 42 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ value: 42 });

    unsubscribe();
  });

  it('returns an unsubscribe function that detaches listeners', () => {
    const handler = vi.fn<[payload: { value: number }], void>();
    const unsubscribe = bus.on('core:test', handler);

    unsubscribe();
    bus.emit('core:test', { value: 7 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports events without payload detail', () => {
    const handler = vi.fn<[payload: undefined], void>();
    const unsubscribe = bus.on('core:ping', handler);

    bus.emit('core:ping');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]).toEqual([undefined]);

    unsubscribe();
  });

  it('narrows event names and payloads via declaration merging', () => {
    expectTypeOf<'core:test'>().toMatchTypeOf<GameEventName>();
    expectTypeOf<'core:ping'>().toMatchTypeOf<GameEventName>();
    expectTypeOf<'core:unknown'>().not.toMatchTypeOf<GameEventName>();

    expectTypeOf<GameEvents['core:test']>().toEqualTypeOf<{ value: number }>();
    expectTypeOf<GameEvents['core:ping']>().toEqualTypeOf<undefined>();

    const unsubscribe = bus.on('core:test', (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ value: number }>();
    });
    unsubscribe();

    bus.emit('core:test', { value: 12 });
    bus.emit('core:ping');
  });

  it('no-ops when the feature flag is disabled', () => {
    vi.stubEnv('VITE_FF_F02', 'false');

    const handler = vi.fn<[payload: { value: number }], void>();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const unsubscribe = on('core:test', handler);
    on('core:test', handler);

    emit('core:test', { value: 99 });
    off('core:test', handler);
    unsubscribe();

    expect(addSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });
});
