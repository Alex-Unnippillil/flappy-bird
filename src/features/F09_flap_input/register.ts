import { featureBus, type FeatureBus } from "../bus";
import { bus as gameBus } from "@/core";

type GameBus = typeof gameBus;

export type FlapInputSource = "keyboard" | "pointer" | "touch";

export interface FlapInputEvent {
  source: FlapInputSource;
  originalEvent: Event;
}

export interface GameStateChangeDetail {
  state?: string;
}

export interface RegisterFlapInputOptions {
  /**
   * Optional override for feature flag evaluation. When provided this takes precedence
   * over the environment flag.
   */
  enabled?: boolean;
  /**
   * Environment variables used to resolve feature flags. Defaults to `import.meta.env`.
   */
  env?: Record<string, unknown>;
  /** Optional window object override, primarily for testing. */
  window?: Window | null;
  /** Optional document object override, primarily for testing. */
  document?: Document | null;
  /** Canvas element that should receive pointer/touch interactions. */
  canvas?: HTMLElement | null;
  /** Event bus instance used to emit feature events. Defaults to the shared feature bus. */
  bus?: FeatureBus;
  /** Game event bus used to observe state transitions. */
  gameBus?: GameBus;
  /** Minimum interval in milliseconds before another flap event can be emitted. */
  debounceMs?: number;
}

const FEATURE_FLAG_KEY = "VITE_FF_F09" as const;
const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enable", "enabled"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", "disable", "disabled"]);
const DEFAULT_DEBOUNCE_MS = 80;

const noop = () => {};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return null;
};

const resolveEnv = (env?: Record<string, unknown>): Record<string, unknown> => {
  if (env) {
    return { ...env };
  }

  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  return { ...(meta.env ?? {}) };
};

const resolveFlag = (
  options: Pick<RegisterFlapInputOptions, "enabled" | "env">,
): boolean => {
  if (typeof options.enabled === "boolean") {
    return options.enabled;
  }

  const env = resolveEnv(options.env);
  const raw = env[FEATURE_FLAG_KEY];
  const normalized = normalizeBoolean(raw);
  return normalized ?? false;
};

const resolveWindow = (win?: Window | null): Window | null => {
  if (win !== undefined) {
    return win ?? null;
  }

  if (typeof window !== "undefined") {
    return window;
  }

  return null;
};

const resolveDocument = (doc?: Document | null, win?: Window | null): Document | null => {
  if (doc !== undefined) {
    return doc ?? null;
  }

  return win?.document ?? null;
};

const resolveCanvas = (
  canvas: HTMLElement | null | undefined,
  doc: Document | null,
): HTMLElement | null => {
  if (canvas !== undefined) {
    return canvas ?? null;
  }

  return (doc?.getElementById?.("gameCanvas") as HTMLElement | null) ?? null;
};

const getTimestamp = (event: Event, win: Window): number => {
  const timeStamp = (event as { timeStamp?: unknown }).timeStamp;
  if (typeof timeStamp === "number" && Number.isFinite(timeStamp)) {
    return timeStamp;
  }

  if (typeof win.performance?.now === "function") {
    return win.performance.now();
  }

  return Date.now();
};

export function register(options: RegisterFlapInputOptions = {}): () => void {
  if (!resolveFlag(options)) {
    return noop;
  }

  const win = resolveWindow(options.window);
  const doc = resolveDocument(options.document, win);
  const canvas = resolveCanvas(options.canvas ?? null, doc);

  if (!win || !doc || !canvas) {
    return noop;
  }

  const bus = options.bus ?? featureBus;
  const game = options.gameBus ?? gameBus;
  const debounceMs = Math.max(0, options.debounceMs ?? DEFAULT_DEBOUNCE_MS);

  let isRunning = false;
  let lastEmitTime = -Infinity;

  const cleanupTasks = new Set<() => void>();
  let disposed = false;

  const registerCleanup = (task: () => void) => {
    cleanupTasks.add(task);
  };

  const resetDebounce = () => {
    lastEmitTime = -Infinity;
  };

  const shouldEmit = (event: Event): boolean => {
    if (!isRunning) {
      return false;
    }

    const now = getTimestamp(event, win);
    if (now - lastEmitTime < debounceMs) {
      return false;
    }

    lastEmitTime = now;
    return true;
  };

  const emitFlap = (source: FlapInputSource, event: Event) => {
    if (!shouldEmit(event)) {
      return;
    }

    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    bus.emit("feature:F09/flap", {
      source,
      originalEvent: event,
    });
  };

  const pointerHandler = (event: Event) => {
    emitFlap("pointer", event);
  };

  const touchHandler = (event: Event) => {
    emitFlap("touch", event);
  };

  const keydownHandler = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }

    if (event.code !== "Space") {
      return;
    }

    emitFlap("keyboard", event);
  };

  const pointerOptions: AddEventListenerOptions = { passive: false };
  const touchOptions: AddEventListenerOptions = { passive: false };
  const keyOptions: AddEventListenerOptions = { passive: false };

  canvas.addEventListener("pointerdown", pointerHandler, pointerOptions);
  registerCleanup(() => {
    canvas.removeEventListener("pointerdown", pointerHandler, pointerOptions);
  });

  canvas.addEventListener("touchstart", touchHandler, touchOptions);
  registerCleanup(() => {
    canvas.removeEventListener("touchstart", touchHandler, touchOptions);
  });

  canvas.addEventListener("keydown", keydownHandler, keyOptions);
  win.addEventListener("keydown", keydownHandler, keyOptions);
  registerCleanup(() => {
    canvas.removeEventListener("keydown", keydownHandler, keyOptions);
    win.removeEventListener("keydown", keydownHandler, keyOptions);
  });

  if (game && typeof game.on === "function") {
    const unsubscribe = game.on("game:state-change", (detail: GameStateChangeDetail | undefined) => {
      isRunning = detail?.state === "running";
      resetDebounce();
    });
    registerCleanup(unsubscribe);
  }

  const unloadHandler = () => {
    cleanup();
  };

  win.addEventListener("beforeunload", unloadHandler);
  registerCleanup(() => {
    win.removeEventListener("beforeunload", unloadHandler);
  });

  const cleanup = () => {
    if (disposed) {
      return;
    }
    disposed = true;

    cleanupTasks.forEach((task) => {
      try {
        task();
      } catch {
        // Ignore teardown errors to prevent masking subsequent cleanup tasks.
      }
    });

    cleanupTasks.clear();
    resetDebounce();
  };

  return cleanup;
}

export default register;
