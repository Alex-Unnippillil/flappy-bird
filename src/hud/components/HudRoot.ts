import '../styles/root.css';

type HudRenderable =
  | Node
  | string
  | null
  | undefined
  | (() => Node | string | null | undefined);

export interface HudConfig {
  topLeft?: HudRenderable;
  topRight?: HudRenderable;
  center?: HudRenderable;
  onResize?: (metrics: { width: number; height: number; scale: number }) => void;
}

export interface HudRootHandle {
  element: HTMLElement;
  destroy: () => void;
}

const MIN_VIEWPORT_WIDTH = 320;
const MAX_VIEWPORT_WIDTH = 1920;
const MIN_GAP = 12;
const MAX_GAP = 48;
const MIN_PADDING = 12;
const MAX_PADDING = 64;

function resolveRenderable(renderable: HudRenderable): Node[] {
  if (typeof renderable === 'function') {
    return resolveRenderable(renderable());
  }

  if (renderable == null) {
    return [];
  }

  if (typeof renderable === 'string') {
    return [document.createTextNode(renderable)];
  }

  if (renderable instanceof Node) {
    return [renderable];
  }

  throw new TypeError('Unsupported HUD renderable type.');
}

function populateSlot(slot: HTMLElement, renderable: HudRenderable) {
  slot.replaceChildren(...resolveRenderable(renderable));
}

function calculateScale(width: number): number {
  const clampedWidth = Math.min(Math.max(width, MIN_VIEWPORT_WIDTH), MAX_VIEWPORT_WIDTH);
  return clampedWidth / MAX_VIEWPORT_WIDTH;
}

function interpolate(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

export function initHudRoot(config: HudConfig = {}): HudRootHandle {
  const root = document.querySelector<HTMLElement>('#hud-root');

  if (!root) {
    throw new Error('Unable to initialise HUD: missing #hud-root element.');
  }

  const container = document.createElement('section');
  container.classList.add('hud-root');

  const slots: Record<'topLeft' | 'topRight' | 'center', HTMLElement> = {
    topLeft: document.createElement('div'),
    topRight: document.createElement('div'),
    center: document.createElement('div'),
  };

  slots.topLeft.classList.add('hud-slot', 'hud-top-left');
  slots.topRight.classList.add('hud-slot', 'hud-top-right');
  slots.center.classList.add('hud-slot', 'hud-center');

  populateSlot(slots.topLeft, config.topLeft ?? null);
  populateSlot(slots.topRight, config.topRight ?? null);
  populateSlot(slots.center, config.center ?? null);

  container.append(slots.topLeft, slots.topRight, slots.center);

  root.replaceChildren(container);

  const state: { rafId: number | null; width: number; height: number } = {
    rafId: null,
    width: MAX_VIEWPORT_WIDTH,
    height: 0,
  };

  const applyMetrics = (width: number, height: number) => {
    state.width = width;
    state.height = height;

    if (state.rafId !== null) {
      return;
    }

    state.rafId = window.requestAnimationFrame(() => {
      const scale = calculateScale(state.width);
      const easedScale = Math.max(scale, MIN_VIEWPORT_WIDTH / MAX_VIEWPORT_WIDTH);
      const gap = interpolate(MIN_GAP, MAX_GAP, easedScale);
      const padding = interpolate(MIN_PADDING, MAX_PADDING, easedScale);

      container.style.setProperty('--hud-scale', easedScale.toFixed(4));
      container.style.setProperty('--hud-gap', `${gap.toFixed(2)}px`);
      container.style.setProperty('--hud-padding', `${padding.toFixed(2)}px`);

      config.onResize?.({
        width: state.width,
        height: state.height,
        scale: easedScale,
      });

      state.rafId = null;
    });
  };

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      applyMetrics(width, height);
    }
  });

  resizeObserver.observe(document.documentElement);

  return {
    element: container,
    destroy: () => {
      resizeObserver.disconnect();
      if (state.rafId !== null) {
        window.cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
    },
  };
}
