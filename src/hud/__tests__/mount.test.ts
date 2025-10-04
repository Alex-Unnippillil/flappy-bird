import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHud, unmountHud } from '../mount';

describe('mountHud', () => {
  beforeEach(() => {
    unmountHud();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts the HUD root inside the document body by default', () => {
    const container = mountHud();

    expect(container.id).toBe('hud-root');
    expect(document.body.contains(container)).toBe(true);
    expect(document.querySelectorAll('#hud-root')).toHaveLength(1);
  });

  it('reuses the same HUD root on repeated mounts', () => {
    const first = mountHud();
    const second = mountHud();

    expect(second).toBe(first);
    expect(document.querySelectorAll('#hud-root')).toHaveLength(1);
  });

  it('moves the HUD root to a provided host element', () => {
    const customHost = document.createElement('div');
    document.body.append(customHost);

    const container = mountHud(customHost);

    expect(container.parentElement).toBe(customHost);
    expect(customHost.contains(container)).toBe(true);
  });

  it('removes listeners and DOM nodes on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const container = mountHud();
    const resizeCall = addSpy.mock.calls.find(([type]) => type === 'resize');

    expect(resizeCall).toBeDefined();

    const handler = resizeCall?.[1];

    expect(handler).toBeTypeOf('function');

    unmountHud();

    expect(removeSpy).toHaveBeenCalledWith('resize', handler);
    expect(document.contains(container)).toBe(false);
    expect(document.getElementById('hud-root')).toBeNull();
  });
});
