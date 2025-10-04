import { featureBus, type FeatureBus } from "../bus";

export const BIRD_POSITION_EVENT = "bird:position" as const;
export const BIRD_COLLIDE_EVENT = "bird:collide" as const;
export const GAME_RESET_EVENT = "game:reset" as const;
export const GAME_OVER_STATE = "GAME_OVER" as const;
const FEATURE_FLAG_KEY = "VITE_FF_F13" as const;

const noop = () => {};

const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enable", "enabled"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", "disable", "disabled"]);

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export interface RigidBodyLike {
  setLinvel?(velocity: Vector3, wake: boolean): void;
  setAngvel?(velocity: Vector3, wake: boolean): void;
  lockTranslations?(locked: boolean, wake: boolean): void;
  lockRotations?(locked: boolean, wake: boolean): void;
  sleep?(): void;
}

export interface BirdPositionUpdatePayload {
  position: Vector3;
  radius: number;
  dt: number;
  rigidBody?: RigidBodyLike | null;
}

export interface BirdCollisionDetail {
  position: Vector3;
  groundHeight: number;
  dt: number;
}

export type GameStateValue = typeof GAME_OVER_STATE | string;

export interface GameStateMachine {
  transition(nextState: GameStateValue): void;
}

export interface RegisterGroundCollisionOptions {
  enabled?: boolean;
  groundHeight?: number;
  bus?: FeatureBus;
  stateMachine: GameStateMachine;
  freezeFlagEnabled?: boolean;
}

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) return true;
    if (FALSE_VALUES.has(normalized)) return false;
  }

  return null;
}

function resolveFreezeFlag(): boolean {
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const fromMeta = normalizeBoolean(meta.env?.[FEATURE_FLAG_KEY]);
  if (fromMeta !== null) {
    return fromMeta;
  }

  if (typeof process !== "undefined" && process?.env) {
    const fromProcess = normalizeBoolean(process.env[FEATURE_FLAG_KEY]);
    if (fromProcess !== null) {
      return fromProcess;
    }
  }

  const globalShim = globalThis as unknown as {
    __FEATURE_FLAGS__?: Record<string, unknown>;
  };

  const fromGlobal = normalizeBoolean(
    globalShim.__FEATURE_FLAGS__?.[FEATURE_FLAG_KEY],
  );
  if (fromGlobal !== null) {
    return fromGlobal;
  }

  return false;
}

function computeBottom(position: Vector3, radius: number): number {
  return position.y - radius;
}

function crossesGround(
  previousBottom: number | null,
  currentBottom: number,
  groundHeight: number,
): boolean {
  if (currentBottom <= groundHeight) {
    return true;
  }

  if (previousBottom === null) {
    return false;
  }

  if (previousBottom <= groundHeight) {
    return true;
  }

  const min = Math.min(previousBottom, currentBottom);
  const max = Math.max(previousBottom, currentBottom);
  return min <= groundHeight && max >= groundHeight;
}

function freezeRigidBody(rigidBody: RigidBodyLike | null | undefined): void {
  if (!rigidBody) {
    return;
  }

  try {
    rigidBody.setLinvel?.({ x: 0, y: 0, z: 0 }, true);
  } catch (_error) {
    // Ignore Rapier interop errors to avoid breaking the game loop.
  }

  try {
    rigidBody.setAngvel?.({ x: 0, y: 0, z: 0 }, true);
  } catch (_error) {
    // Ignore Rapier interop errors to avoid breaking the game loop.
  }

  try {
    rigidBody.lockTranslations?.(true, true);
  } catch (_error) {
    // Ignore Rapier interop errors to avoid breaking the game loop.
  }

  try {
    rigidBody.lockRotations?.(true, true);
  } catch (_error) {
    // Ignore Rapier interop errors to avoid breaking the game loop.
  }

  try {
    rigidBody.sleep?.();
  } catch (_error) {
    // Ignore Rapier interop errors to avoid breaking the game loop.
  }
}

export function register({
  enabled = true,
  groundHeight = 0,
  bus = featureBus,
  stateMachine,
  freezeFlagEnabled,
}: RegisterGroundCollisionOptions): () => void {
  if (!enabled) {
    return noop;
  }

  const freezeOnCollision = freezeFlagEnabled ?? resolveFreezeFlag();

  let previousBottom: number | null = null;
  let hasCollided = false;

  const handlePositionUpdate = (payload: BirdPositionUpdatePayload) => {
    if (hasCollided) {
      return;
    }

    const bottom = computeBottom(payload.position, payload.radius);
    const didCollide = crossesGround(previousBottom, bottom, groundHeight);
    previousBottom = bottom;

    if (!didCollide) {
      return;
    }

    hasCollided = true;

    if (freezeOnCollision) {
      freezeRigidBody(payload.rigidBody);
    }

    try {
      stateMachine.transition(GAME_OVER_STATE);
    } catch (_error) {
      // Swallow state machine errors to keep the collision handler resilient.
    }

    bus.emit(BIRD_COLLIDE_EVENT, {
      position: payload.position,
      groundHeight,
      dt: payload.dt,
    });
  };

  const handleReset = () => {
    previousBottom = null;
    hasCollided = false;
  };

  const disposePosition = bus.on(BIRD_POSITION_EVENT, handlePositionUpdate);
  const disposeReset = bus.on(GAME_RESET_EVENT, handleReset);

  return () => {
    disposePosition();
    disposeReset();
  };
}

export default register;
