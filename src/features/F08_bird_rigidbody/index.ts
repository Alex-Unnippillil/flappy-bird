import { bus as coreBus } from "@/core/event-bus";
import { featureBus } from "../bus";
import {
  context as settingsContext,
  F05_BIRD_RIGIDBODY_DEFAULTS,
} from "../F05_settings_context";
import type {
  BirdRigidbodyConstants,
  BirdRigidbodyUpdateDetail,
  GameStateChangeDetail,
  GameTickEventDetail,
  RegisterBirdRigidbodyOptions,
} from "./types";

type GameTickPayload = GameEvents["game:tick"] & Partial<GameTickEventDetail>;
type GameStateChangePayload =
  GameEvents["game:state-change"] & Partial<GameStateChangeDetail>;

const BASE_STEP_MS = 1000 / 60;

const SETTINGS_KEY_MAP: Record<keyof BirdRigidbodyConstants, readonly string[]> = {
  gravity: [
    "features.F08.bird.gravity",
    "physics.bird.gravity",
    "bird.gravity",
    "birdGravity",
    "F08_BIRD_GRAVITY",
    "VITE_F08_BIRD_GRAVITY",
    "F05_BIRD_GRAVITY",
  ],
  terminalVelocity: [
    "features.F08.bird.terminalVelocity",
    "physics.bird.terminalVelocity",
    "bird.terminalVelocity",
    "birdTerminalVelocity",
    "F08_BIRD_TERMINAL",
    "VITE_F08_BIRD_TERMINAL",
    "F05_BIRD_TERMINAL",
  ],
  initialPosition: [
    "features.F08.bird.initialPosition",
    "bird.initialPosition",
    "F08_BIRD_INITIAL_POSITION",
    "F05_BIRD_INITIAL_POSITION",
  ],
  initialVelocity: [
    "features.F08.bird.initialVelocity",
    "bird.initialVelocity",
    "F08_BIRD_INITIAL_VELOCITY",
    "F05_BIRD_INITIAL_VELOCITY",
  ],
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const readSetting = (settings: Record<string, unknown>, path: string): unknown => {
  if (!path.includes(".")) {
    return settings[path];
  }

  const segments = path.split(".");
  let cursor: unknown = settings;
  for (const segment of segments) {
    if (!cursor || typeof cursor !== "object") {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
};

const resolveFromSettings = (
  key: keyof BirdRigidbodyConstants,
): number | null => {
  if (!settingsContext?.settings) {
    return null;
  }

  const settings = settingsContext.settings as Record<string, unknown>;
  for (const path of SETTINGS_KEY_MAP[key]) {
    const candidate = readSetting(settings, path);
    const normalized = toFiniteNumber(candidate);
    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
};

const resolveConstants = (
  overrides?: Partial<BirdRigidbodyConstants>,
): BirdRigidbodyConstants => {
  const result = { ...F05_BIRD_RIGIDBODY_DEFAULTS } as BirdRigidbodyConstants;

  const keys: Array<keyof BirdRigidbodyConstants> = [
    "gravity",
    "terminalVelocity",
    "initialPosition",
    "initialVelocity",
  ];

  keys.forEach((key) => {
    const overrideValue = overrides ? toFiniteNumber(overrides[key]) : null;
    if (overrideValue !== null) {
      result[key] = overrideValue;
      return;
    }

    const fromSettings = resolveFromSettings(key);
    if (fromSettings !== null) {
      result[key] = fromSettings;
    }
  });

  return result;
};

const normalizeDelta = (detail: GameTickPayload | undefined | null): number => {
  if (!detail) {
    return 0;
  }

  const candidates = [detail.delta, detail.dt];
  for (const candidate of candidates) {
    const normalized = toFiniteNumber(candidate);
    if (normalized !== null) {
      return normalized;
    }
  }

  return toFiniteNumber(detail.dt) ?? 0;
};

const createInitialState = (
  constants: BirdRigidbodyConstants,
): { position: number; velocity: number } => ({
  position: constants.initialPosition,
  velocity: constants.initialVelocity,
});

const normalizeStateName = (value: string | null | undefined): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

let activeCleanup: (() => void) | null = null;

const registerInternal = (
  options: RegisterBirdRigidbodyOptions = {},
): (() => void) => {
  const eventBus = options.eventBus ?? coreBus;
  const featureEventBus = options.featureBus ?? featureBus;
  const constants = resolveConstants(options.constants);

  let state = createInitialState(constants);
  let disposed = false;
  let frameCounter = 0;
  let currentState = "";
  let tickDisposer: (() => void) | null = null;
  const lifecycleDisposers = new Set<() => void>();

  const resetState = () => {
    state = createInitialState(constants);
    frameCounter = 0;
  };

  const detachTick = () => {
    if (tickDisposer) {
      tickDisposer();
      tickDisposer = null;
    }
  };

  const handleTick = (detail: GameTickPayload) => {
    if (disposed) {
      return;
    }

    const delta = normalizeDelta(detail);
    if (!Number.isFinite(delta) || delta <= 0) {
      return;
    }

    const previousPosition = state.position;
    const previousVelocity = state.velocity;
    const acceleration = constants.gravity;

    const nextVelocity = Math.min(
      previousVelocity + acceleration * delta,
      constants.terminalVelocity,
    );
    const nextPosition = previousPosition + nextVelocity * delta;

    state = {
      position: nextPosition,
      velocity: nextVelocity,
    };

    let frame = frameCounter;
    const providedFrame = toFiniteNumber(detail.frame);
    if (providedFrame !== null) {
      frame = Math.trunc(providedFrame);
      frameCounter = frame + 1;
    } else {
      frameCounter += 1;
    }

    const elapsedMs =
      toFiniteNumber(detail.elapsedMs) ?? Math.max(delta, 0) * BASE_STEP_MS;

    const payload: BirdRigidbodyUpdateDetail = {
      position: nextPosition,
      velocity: nextVelocity,
      acceleration,
      delta,
      elapsedMs,
      frame,
      previousVelocity,
      previousPosition,
      terminalVelocity: constants.terminalVelocity,
    };

    featureEventBus.emit("feature:F08/bird:update", payload);
  };

  const ensureTick = () => {
    if (disposed || tickDisposer) {
      return;
    }
    tickDisposer = eventBus.on("game:tick", handleTick);
  };

  const handleWorldReset = () => {
    detachTick();
    resetState();
    currentState = "";
  };

  const handleStateChange = (detail: GameStateChangePayload | undefined) => {
    const nextState = normalizeStateName(detail?.state ?? detail?.to);
    if (!nextState || nextState === currentState) {
      return;
    }

    currentState = nextState;

    if (nextState === "running") {
      const previous = normalizeStateName(detail?.previousState ?? detail?.from);
      if (previous !== "running") {
        resetState();
      }
      ensureTick();
      return;
    }

    if (nextState === "ready" || nextState === "menu" || nextState === "reset") {
      detachTick();
      resetState();
      return;
    }

    if (nextState === "game-over" || nextState === "paused") {
      detachTick();
    }
  };

  lifecycleDisposers.add(eventBus.on("world:reset", handleWorldReset));
  lifecycleDisposers.add(eventBus.on("game:state-change", handleStateChange));

  if (options.autoStart !== false) {
    ensureTick();
  }

  const cleanup = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    detachTick();
    lifecycleDisposers.forEach((dispose) => {
      try {
        dispose();
      } catch {
        // Ignore teardown errors so later disposers still run.
      }
    });
    lifecycleDisposers.clear();
  };

  return cleanup;
};

export const registerF08BirdRigidbody = (
  options: RegisterBirdRigidbodyOptions = {},
): (() => void) => {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const cleanup = registerInternal(options);
  const wrappedCleanup = () => {
    cleanup();
    if (activeCleanup === wrappedCleanup) {
      activeCleanup = null;
    }
  };

  activeCleanup = wrappedCleanup;
  return wrappedCleanup;
};

export default registerF08BirdRigidbody;
export type { BirdRigidbodyUpdateDetail, GameTickEventDetail } from "./types";
