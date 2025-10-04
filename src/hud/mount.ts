const HUD_ROOT_ID = 'hud-root';

let hudContainer: HTMLElement | null = null;
let resizeHandler: (() => void) | null = null;

const resolveHost = (root?: HTMLElement): HTMLElement => {
  const host = root ?? document.body;

  if (!host) {
    throw new Error('Cannot mount HUD: document.body is not available.');
  }

  return host;
};

const ensureContainer = (): HTMLElement => {
  if (hudContainer && hudContainer.isConnected) {
    return hudContainer;
  }

  const existing = document.getElementById(HUD_ROOT_ID) as HTMLElement | null;

  if (existing) {
    hudContainer = existing;
    return existing;
  }

  const container = document.createElement('div');
  container.id = HUD_ROOT_ID;
  hudContainer = container;

  return container;
};

const ensureResizeHandler = () => {
  if (resizeHandler) {
    return;
  }

  resizeHandler = () => {
    if (!hudContainer) {
      return;
    }

    hudContainer.dataset.viewport = `${window.innerWidth}x${window.innerHeight}`;
  };

  window.addEventListener('resize', resizeHandler);
};

export const mountHud = (root?: HTMLElement): HTMLElement => {
  const host = resolveHost(root);
  const container = ensureContainer();

  if (container.parentElement !== host) {
    host.appendChild(container);
  }

  ensureResizeHandler();
  resizeHandler?.();

  return container;
};

export const unmountHud = (): void => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }

  if (hudContainer) {
    hudContainer.remove();
    hudContainer = null;
  }
};
