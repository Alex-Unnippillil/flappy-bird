import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";

export type FixedUpdateCallback = (fixedDelta: number) => void;
export type FrameUpdateCallback = (delta: number) => void;

export type PrimaryInputPhase = "start" | "end";
export type PrimaryInputSource = "keyboard" | "pointer" | "touch";

export interface UnifiedInputEvent {
  readonly type: "primary";
  readonly phase: PrimaryInputPhase;
  readonly source: PrimaryInputSource;
  readonly pointerPosition: { x: number; y: number } | null;
  readonly originalEvent: KeyboardEvent | PointerEvent | TouchEvent;
}

export interface ThreeApp {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly start: () => void;
  readonly stop: () => void;
  readonly dispose: () => void;
  readonly isRunning: () => boolean;
  readonly isReducedMotion: () => boolean;
  readonly addFixedUpdateListener: (callback: FixedUpdateCallback) => () => void;
  readonly addFrameListener: (callback: FrameUpdateCallback) => () => void;
  readonly addInputListener: (callback: (event: UnifiedInputEvent) => void) => () => void;
}

export interface ThreeAppOptions {
  readonly clearColor?: string | number;
  readonly antialias?: boolean;
  readonly fov?: number;
  readonly near?: number;
  readonly far?: number;
  readonly maxPixelRatio?: number;
  readonly fixedTimeStep?: number;
  readonly maxSubSteps?: number;
  readonly reducedMotionFps?: number;
}

const KEYBOARD_PRIMARY_CODES = new Set(["Space", "ArrowUp", "KeyW"]);

function computePointerPosition(
  canvas: HTMLCanvasElement,
  event: PointerEvent | TouchEvent
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width;
  const height = rect.height || canvas.height;

  if (width === 0 || height === 0) {
    return null;
  }

  let clientX: number | undefined;
  let clientY: number | undefined;

  if (event instanceof PointerEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  }

  if (clientX === undefined || clientY === undefined) {
    return null;
  }

  return {
    x: (clientX - rect.left) / width,
    y: (clientY - rect.top) / height,
  };
}

export function createThreeApp(
  canvas: HTMLCanvasElement,
  options: ThreeAppOptions = {}
): ThreeApp {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: options.antialias ?? true,
    alpha: true,
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;

  const scene = new Scene();
  scene.background = new Color(options.clearColor ?? "#87ceeb");

  const camera = new PerspectiveCamera(
    options.fov ?? 60,
    1,
    options.near ?? 0.1,
    options.far ?? 100
  );
  camera.position.set(0, 1.75, 4.5);
  camera.lookAt(0, 1, 0);

  const ambientLight = new AmbientLight(0xffffff, 0.7);
  const directionalLight = new DirectionalLight(0xffffff, 0.85);
  directionalLight.position.set(6, 8, 4);
  directionalLight.castShadow = true;

  scene.add(ambientLight, directionalLight);

  const fixedUpdateCallbacks = new Set<FixedUpdateCallback>();
  const frameCallbacks = new Set<FrameUpdateCallback>();
  const inputCallbacks = new Set<(event: UnifiedInputEvent) => void>();

  const fixedTimeStep = options.fixedTimeStep ?? 1 / 60;
  const fixedStepMs = fixedTimeStep * 1000;
  const maxSubSteps = Math.max(1, Math.floor(options.maxSubSteps ?? 5));
  const maxAccumulatedTime = fixedStepMs * maxSubSteps;
  const maxFrameDelta = 250;
  const maxPixelRatio = options.maxPixelRatio ?? 2;
  const reducedMotionFrameDuration = 1000 / Math.max(1, options.reducedMotionFps ?? 30);

  let accumulator = 0;
  let lastTimestamp: number | null = null;
  let running = false;
  let rafHandle = 0;
  let timeoutHandle = 0;

  const pressedKeys = new Set<string>();
  const activePointerIds = new Set<number>();
  const supportsPointerEvents = typeof window !== "undefined" && "PointerEvent" in window;

  const resize = () => {
    const width = canvas.clientWidth || canvas.width || 1;
    const height = canvas.clientHeight || canvas.height || 1;

    renderer.setPixelRatio(Math.min(maxPixelRatio, window.devicePixelRatio || 1));
    renderer.setSize(width, height, false);

    const aspect = width / height;
    if (Number.isFinite(aspect) && aspect > 0) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  };

  const prefersReducedMotionQuery =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : undefined;

  let reducedMotion = prefersReducedMotionQuery?.matches ?? false;

  const emitInput = (
    phase: PrimaryInputPhase,
    source: PrimaryInputSource,
    event: KeyboardEvent | PointerEvent | TouchEvent,
    pointerPosition: { x: number; y: number } | null
  ) => {
    const payload: UnifiedInputEvent = Object.freeze({
      type: "primary" as const,
      phase,
      source,
      pointerPosition,
      originalEvent: event,
    });

    inputCallbacks.forEach((callback) => callback(payload));
  };

  const scheduleNextFrame = () => {
    if (!running) {
      return;
    }

    if (reducedMotion) {
      timeoutHandle = window.setTimeout(() => {
        timeoutHandle = 0;
        loop(performance.now());
      }, reducedMotionFrameDuration);
    } else {
      rafHandle = window.requestAnimationFrame(loop);
    }
  };

  const loop = (timestamp: number) => {
    if (!running) {
      return;
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    let deltaMs = timestamp - lastTimestamp;
    if (!Number.isFinite(deltaMs) || deltaMs < 0) {
      deltaMs = fixedStepMs;
    }

    if (deltaMs > maxFrameDelta) {
      deltaMs = maxFrameDelta;
    }

    accumulator += deltaMs;
    if (accumulator > maxAccumulatedTime) {
      accumulator = maxAccumulatedTime;
    }

    while (accumulator >= fixedStepMs) {
      fixedUpdateCallbacks.forEach((callback) => {
        callback(fixedTimeStep);
      });
      accumulator -= fixedStepMs;
    }

    const deltaSeconds = deltaMs / 1000;
    frameCallbacks.forEach((callback) => {
      callback(deltaSeconds);
    });

    renderer.render(scene, camera);

    lastTimestamp = timestamp;
    scheduleNextFrame();
  };

  const start = () => {
    if (running) {
      return;
    }

    running = true;
    accumulator = 0;
    lastTimestamp = null;
    resize();
    renderer.render(scene, camera);
    scheduleNextFrame();
  };

  const cancelScheduledFrame = () => {
    if (rafHandle !== 0) {
      window.cancelAnimationFrame(rafHandle);
      rafHandle = 0;
    }

    if (timeoutHandle !== 0) {
      window.clearTimeout(timeoutHandle);
      timeoutHandle = 0;
    }
  };

  const stop = () => {
    if (!running) {
      return;
    }

    running = false;
    cancelScheduledFrame();
    accumulator = 0;
    lastTimestamp = null;
  };

  const handleMotionChange = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches;
    if (!running) {
      return;
    }

    cancelScheduledFrame();
    lastTimestamp = null;
    scheduleNextFrame();
  };

  if (prefersReducedMotionQuery) {
    if (typeof prefersReducedMotionQuery.addEventListener === "function") {
      prefersReducedMotionQuery.addEventListener("change", handleMotionChange);
    } else if (typeof prefersReducedMotionQuery.addListener === "function") {
      prefersReducedMotionQuery.addListener(handleMotionChange);
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!KEYBOARD_PRIMARY_CODES.has(event.code)) {
      return;
    }

    event.preventDefault();
    if (event.repeat || pressedKeys.has(event.code)) {
      return;
    }

    pressedKeys.add(event.code);
    emitInput("start", "keyboard", event, null);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!KEYBOARD_PRIMARY_CODES.has(event.code)) {
      return;
    }

    event.preventDefault();
    pressedKeys.delete(event.code);
    emitInput("end", "keyboard", event, null);
  };

  const blurListener = () => {
    if (pressedKeys.size > 0) {
      pressedKeys.clear();
      const syntheticEvent = new KeyboardEvent("keyup");
      emitInput("end", "keyboard", syntheticEvent, null);
    }

    if (activePointerIds.size > 0) {
      activePointerIds.clear();
      const syntheticEvent = new PointerEvent("pointerup");
      emitInput("end", "pointer", syntheticEvent, null);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", blurListener);

  const pointerDownListener = (event: PointerEvent) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    const source: PrimaryInputSource = event.pointerType === "touch" ? "touch" : "pointer";
    activePointerIds.add(event.pointerId);
    if (canvas.hasPointerCapture && !canvas.hasPointerCapture(event.pointerId)) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Ignore capture errors (e.g., canvas is detached)
      }
    }
    if (source === "touch") {
      event.preventDefault();
    }

    emitInput("start", source, event, computePointerPosition(canvas, event));
  };

  const pointerUpListener = (event: PointerEvent) => {
    if (!activePointerIds.has(event.pointerId)) {
      return;
    }

    activePointerIds.delete(event.pointerId);
    const source: PrimaryInputSource = event.pointerType === "touch" ? "touch" : "pointer";
    emitInput("end", source, event, computePointerPosition(canvas, event));
  };

  const pointerCancelListener = (event: PointerEvent) => {
    if (!activePointerIds.has(event.pointerId)) {
      return;
    }

    activePointerIds.delete(event.pointerId);
    const source: PrimaryInputSource = event.pointerType === "touch" ? "touch" : "pointer";
    emitInput("end", source, event, computePointerPosition(canvas, event));
  };

  const touchStartListener = (event: TouchEvent) => {
    event.preventDefault();
    emitInput("start", "touch", event, computePointerPosition(canvas, event));
  };

  const touchEndListener = (event: TouchEvent) => {
    emitInput("end", "touch", event, computePointerPosition(canvas, event));
  };

  const touchCancelListener = (event: TouchEvent) => {
    emitInput("end", "touch", event, computePointerPosition(canvas, event));
  };

  const contextMenuListener = (event: MouseEvent) => {
    event.preventDefault();
  };

  if (supportsPointerEvents) {
    canvas.addEventListener("pointerdown", pointerDownListener);
    canvas.addEventListener("pointerup", pointerUpListener);
    canvas.addEventListener("pointercancel", pointerCancelListener);
  } else {
    canvas.addEventListener("touchstart", touchStartListener, { passive: false });
    canvas.addEventListener("touchend", touchEndListener);
    canvas.addEventListener("touchcancel", touchCancelListener);
  }

  canvas.addEventListener("contextmenu", contextMenuListener);

  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          resize();
        })
      : null;

  if (resizeObserver) {
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  const addFixedUpdateListener = (callback: FixedUpdateCallback) => {
    fixedUpdateCallbacks.add(callback);
    return () => {
      fixedUpdateCallbacks.delete(callback);
    };
  };

  const addFrameListener = (callback: FrameUpdateCallback) => {
    frameCallbacks.add(callback);
    return () => {
      frameCallbacks.delete(callback);
    };
  };

  const addInputListener = (callback: (event: UnifiedInputEvent) => void) => {
    inputCallbacks.add(callback);
    return () => {
      inputCallbacks.delete(callback);
    };
  };

  const dispose = () => {
    stop();
    fixedUpdateCallbacks.clear();
    frameCallbacks.clear();
    inputCallbacks.clear();

    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", blurListener);

    if (supportsPointerEvents) {
      canvas.removeEventListener("pointerdown", pointerDownListener);
      canvas.removeEventListener("pointerup", pointerUpListener);
      canvas.removeEventListener("pointercancel", pointerCancelListener);
    } else {
      canvas.removeEventListener("touchstart", touchStartListener);
      canvas.removeEventListener("touchend", touchEndListener);
      canvas.removeEventListener("touchcancel", touchCancelListener);
    }

    canvas.removeEventListener("contextmenu", contextMenuListener);

    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener("resize", resize);
    }

    if (prefersReducedMotionQuery) {
      if (typeof prefersReducedMotionQuery.removeEventListener === "function") {
        prefersReducedMotionQuery.removeEventListener("change", handleMotionChange);
      } else if (typeof prefersReducedMotionQuery.removeListener === "function") {
        prefersReducedMotionQuery.removeListener(handleMotionChange);
      }
    }

    renderer.dispose();
  };

  return {
    scene,
    camera,
    renderer,
    start,
    stop,
    dispose,
    isRunning: () => running,
    isReducedMotion: () => reducedMotion,
    addFixedUpdateListener,
    addFrameListener,
    addInputListener,
  };
}
