import "./styles.css";
import ScoreHud, { PIPE_CLEARED_EVENT } from "./ScoreHud";

type InitializeOptions = {
  container?: HTMLElement | null;
  eventTarget?: EventTarget;
  force?: boolean;
};

const FEATURE_FLAG_KEY = "FEATURE_F10_SCORE_HUD";

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

const readFeatureFlag = (): boolean => {
  const meta = (import.meta as unknown as { env?: Record<string, unknown> })?.
    env;
  if (meta && FEATURE_FLAG_KEY in meta) {
    return normalizeBoolean(meta[FEATURE_FLAG_KEY]);
  }

  if (typeof process !== "undefined" && process?.env) {
    const fromProcess = process.env[FEATURE_FLAG_KEY];
    if (fromProcess !== undefined) {
      return normalizeBoolean(fromProcess);
    }
  }

  const globalShim =
    globalThis as unknown as { __FEATURE_FLAGS__?: Record<string, unknown> };
  if (globalShim.__FEATURE_FLAGS__ && FEATURE_FLAG_KEY in globalShim.__FEATURE_FLAGS__) {
    return normalizeBoolean(globalShim.__FEATURE_FLAGS__[FEATURE_FLAG_KEY]);
  }

  return false;
};

let instance: ScoreHud | null = null;

export const isScoreHudEnabled = (): boolean => readFeatureFlag();

export const initializeScoreHud = (
  options: InitializeOptions = {},
): ScoreHud | null => {
  if (!options.force && !isScoreHudEnabled()) {
    return null;
  }

  if (instance) {
    return instance;
  }

  const container =
    options.container ??
    document.querySelector<HTMLElement>(".game-stage") ??
    document.getElementById("gameCanvas")?.parentElement ??
    null;

  if (!container) {
    return null;
  }

  const eventTarget = options.eventTarget ?? window;
  instance = new ScoreHud({ container, eventTarget });
  return instance;
};

export const teardownScoreHud = () => {
  if (!instance) return;
  instance.destroy();
  instance = null;
};

const bootstrap = () => {
  if (!isScoreHudEnabled()) {
    return;
  }

  const ready = () => {
    initializeScoreHud();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  } else {
    ready();
  }
};

if (typeof window !== "undefined") {
  bootstrap();
}

// Re-export event names for convenience in tests and integration points.
export { PIPE_CLEARED_EVENT };
