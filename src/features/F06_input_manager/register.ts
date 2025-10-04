import { featureBus, type FeatureBus } from "../bus";

export type InputSource = "keyboard" | "pointer" | "touch";

export interface InputFlapEvent {
  source: InputSource;
  originalEvent: Event;
}

export interface RegisterInputManagerOptions {
  /**
   * Whether the feature flag is enabled. When disabled, the function performs no work
   * and returns a noop disposer.
   */
  enabled?: boolean;
  /** Canvas element that should receive pointer and keyboard focus. */
  canvas?: HTMLElement | null;
  /** Optional window object override, primarily for testing. */
  window?: Window | null;
  /** Optional document object override, primarily for testing. */
  document?: Document | null;
  /**
   * Event bus instance used to emit feature events. Defaults to the shared feature bus
   * singleton.
   */
  bus?: FeatureBus;
  /** Set of keyboard codes that should trigger a flap. */
  actionKeys?: readonly string[];
  /** Keyboard code used to toggle pointer lock. */
  pointerLockKey?: string;
}

const DEFAULT_ACTION_KEYS = ["Space", "ArrowUp", "KeyW", "KeyX"] as const;
const DEFAULT_POINTER_LOCK_KEY = "KeyP" as const;

const noop = () => {};

export function register(options: RegisterInputManagerOptions = {}): () => void {
  if (!options.enabled) {
    return noop;
  }

  const win = options.window ?? (typeof window !== "undefined" ? window : null);
  const doc = options.document ?? win?.document ?? null;
  const canvas =
    options.canvas ?? (doc?.getElementById?.("gameCanvas") as HTMLElement | null);

  if (!win || !doc || !canvas) {
    return noop;
  }

  const bus = options.bus ?? featureBus;
  const actionKeys = new Set(options.actionKeys ?? DEFAULT_ACTION_KEYS);
  const pointerLockKey = options.pointerLockKey ?? DEFAULT_POINTER_LOCK_KEY;

  const cleanupTasks = new Set<() => void>();
  let cleaned = false;

  const registerCleanup = (task: () => void) => {
    cleanupTasks.add(task);
  };

  const emitFlap = (source: InputSource, event: Event) => {
    bus.emit("feature:F06/input:flap", {
      source,
      originalEvent: event,
    });
  };

  const togglePointerLock = () => {
    const requestPointerLock = (canvas as unknown as { requestPointerLock?: () => void })
      .requestPointerLock;
    const exitPointerLock = (doc as unknown as { exitPointerLock?: () => void }).exitPointerLock;

    if (doc.pointerLockElement === canvas) {
      exitPointerLock?.call(doc);
    } else {
      requestPointerLock?.call(canvas);
    }
  };

  const pointerDownHandler = (event: Event) => {
    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    emitFlap("pointer", event);
  };

  canvas.addEventListener("pointerdown", pointerDownHandler);
  registerCleanup(() => {
    canvas.removeEventListener("pointerdown", pointerDownHandler);
  });

  const touchStartHandler = (event: Event) => {
    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    emitFlap("touch", event);
  };

  const touchOptions: AddEventListenerOptions = { passive: false };
  canvas.addEventListener("touchstart", touchStartHandler, touchOptions);
  registerCleanup(() => {
    canvas.removeEventListener("touchstart", touchStartHandler, touchOptions);
  });

  const keydownHandler = (event: KeyboardEvent) => {
    if (event.repeat) return;

    if (event.code === pointerLockKey) {
      event.preventDefault();
      togglePointerLock();
      return;
    }

    if (!actionKeys.has(event.code)) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    emitFlap("keyboard", event);
  };

  const keyOptions: AddEventListenerOptions = { passive: false };
  canvas.addEventListener("keydown", keydownHandler, keyOptions);
  win.addEventListener("keydown", keydownHandler, keyOptions);

  registerCleanup(() => {
    canvas.removeEventListener("keydown", keydownHandler, keyOptions);
    win.removeEventListener("keydown", keydownHandler, keyOptions);
  });

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;

    cleanupTasks.forEach((task) => {
      try {
        task();
      } catch {
        // Ignore teardown errors to avoid masking later cleanup tasks.
      }
    });
    cleanupTasks.clear();

    if (doc.pointerLockElement === canvas) {
      const exitPointerLock = (doc as unknown as { exitPointerLock?: () => void }).exitPointerLock;
      exitPointerLock?.call(doc);
    }
  };

  const unloadHandler = () => {
    cleanup();
  };

  win.addEventListener("beforeunload", unloadHandler);
  registerCleanup(() => {
    win.removeEventListener("beforeunload", unloadHandler);
  });

  return cleanup;
}

export default register;
