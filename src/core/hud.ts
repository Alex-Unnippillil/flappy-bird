const HUD_ROOT_ID = "hud-root";
const DEFAULT_CONTAINER_SELECTOR = ".game-stage";

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "on"].includes(normalized);
  }

  return false;
};

const isHudPerfFlagEnabled = (): boolean => {
  const meta = (import.meta as unknown as { env?: Record<string, unknown> })?.env;
  if (meta && "VITE_FF_F07" in meta) {
    return normalizeBoolean(meta.VITE_FF_F07);
  }

  if (typeof process !== "undefined" && process?.env?.VITE_FF_F07 !== undefined) {
    return normalizeBoolean(process.env.VITE_FF_F07);
  }

  const globalShim = globalThis as unknown as {
    __FEATURE_FLAGS__?: Record<string, unknown>;
  };
  if (globalShim.__FEATURE_FLAGS__ && "VITE_FF_F07" in globalShim.__FEATURE_FLAGS__) {
    return normalizeBoolean(globalShim.__FEATURE_FLAGS__.VITE_FF_F07);
  }

  return false;
};

let cachedRoot: HTMLElement | null = null;
let styleLink: HTMLLinkElement | null = null;

const ensureHudCssLoaded = () => {
  if (!isHudPerfFlagEnabled()) {
    return;
  }

  if (styleLink && document.head?.contains(styleLink)) {
    return;
  }

  const existing = document.head?.querySelector(
    'link[data-hud-root-styles="true"]',
  );
  if (existing instanceof HTMLLinkElement) {
    styleLink = existing;
    return;
  }

  const href = new URL("./hud.css", import.meta.url).href;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.hudRootStyles = "true";
  document.head?.appendChild(link);
  styleLink = link;
};

export type MountHudRootOptions = {
  /**
   * Explicit container that should receive the HUD root element.
   * Defaults to the element with `.game-stage` if present, otherwise `document.body`.
   */
  mountPoint?: HTMLElement | null;
};

const applyPerformanceStyles = (element: HTMLElement) => {
  element.style.transform = "translate3d(0, 0, 0)";
  element.style.willChange = "transform";
  element.style.isolation = "isolate";
};

export const mountHudRoot = (
  options: MountHudRootOptions = {},
): HTMLElement => {
  if (cachedRoot && document.contains(cachedRoot)) {
    ensureHudCssLoaded();
    return cachedRoot;
  }

  const existing = document.getElementById(HUD_ROOT_ID);
  if (existing instanceof HTMLElement) {
    cachedRoot = existing;
    applyPerformanceStyles(existing);
    ensureHudCssLoaded();
    return existing;
  }

  const mountPoint =
    options.mountPoint ??
    document.querySelector<HTMLElement>(DEFAULT_CONTAINER_SELECTOR) ??
    document.body;

  if (!mountPoint) {
    throw new Error("Unable to determine HUD mount point");
  }

  const hudRoot = document.createElement("div");
  hudRoot.id = HUD_ROOT_ID;
  hudRoot.setAttribute("role", "presentation");
  applyPerformanceStyles(hudRoot);

  mountPoint.appendChild(hudRoot);
  cachedRoot = hudRoot;

  ensureHudCssLoaded();

  return hudRoot;
};
