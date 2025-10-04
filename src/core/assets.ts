import { AnimationClip, AnimationMixer, Group, type AnimationAction } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

const FEATURE_FLAG_KEY = 'VITE_FF_F06' as const;
const DEFAULT_BASE_URL = '/';
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'enable', 'enabled']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off', 'disable', 'disabled']);
const BIRD_MODEL_PATH = 'assets/models/bird.glb';
const TEXTURE_DIRECTORY = 'assets/textures/';
const DEFAULT_BIRD_ROTATION_Y = -Math.PI * 0.35;
const DEFAULT_BIRD_SCALE = 1.4;
const DEFAULT_BIRD_Y = 0.05;

export interface LoadBirdOptions {
  env?: Record<string, unknown>;
  loader?: GLTFLoader;
}

export interface LoadedBird {
  root: Group;
  mixer: AnimationMixer | null;
  animations: AnimationClip[];
}

const resolveEnv = (env?: Record<string, unknown>): Record<string, unknown> => {
  if (env) {
    return { ...env };
  }

  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  return { ...(meta.env ?? {}) };
};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === 'string') {
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

const isFeatureEnabled = (env: Record<string, unknown>): boolean => {
  const flagValue = env[FEATURE_FLAG_KEY];
  const normalized = normalizeBoolean(flagValue);
  if (normalized === null) {
    return false;
  }
  return normalized;
};

const resolveBaseUrl = (env: Record<string, unknown>): string => {
  const baseCandidate = env.BASE_URL ?? env.base ?? DEFAULT_BASE_URL;
  if (typeof baseCandidate !== 'string' || baseCandidate.trim() === '') {
    return DEFAULT_BASE_URL;
  }

  const trimmed = baseCandidate.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
};

const resolveAssetUrl = (path: string, env: Record<string, unknown>): string => {
  const base = resolveBaseUrl(env);
  const cleaned = path.replace(/^\/+/, '');
  return `${base}${cleaned}`;
};

const ensureScene = (gltf: GLTF): Group => {
  if (gltf.scene) {
    return gltf.scene;
  }
  if (gltf.scenes && gltf.scenes.length > 0) {
    return gltf.scenes[0] as Group;
  }
  return new Group();
};

const prepareAnimation = (root: Group, animations: AnimationClip[]): AnimationMixer | null => {
  const clip = AnimationClip.findByName(animations, 'Flap') ?? animations[0];
  if (!clip) {
    return null;
  }

  const mixer = new AnimationMixer(root);
  const action: AnimationAction = mixer.clipAction(clip);
  action.play();
  return mixer;
};

const formatLoadError = (modelUrl: string, error: unknown): Error => {
  const parts = [
    `Failed to load bird rig from "${modelUrl}".`,
    'Ensure procedural assets are generated via "python tools/generate_bird_assets.py" and served from "public/assets".',
  ];

  if (error instanceof Error && error.message) {
    parts.push(`Original error: ${error.message}`);
  } else if (typeof error === 'string' && error.trim() !== '') {
    parts.push(`Original error: ${error}`);
  }

  return new Error(parts.join(' '));
};

export async function loadBird(options: LoadBirdOptions = {}): Promise<LoadedBird> {
  const env = resolveEnv(options.env);

  if (!isFeatureEnabled(env)) {
    throw new Error(
      `Feature flag ${FEATURE_FLAG_KEY} is disabled. Enable it in your Vite environment to load bird assets.`,
    );
  }

  const loader = options.loader ?? new GLTFLoader();
  const modelUrl = resolveAssetUrl(BIRD_MODEL_PATH, env);
  const textureUrl = resolveAssetUrl(TEXTURE_DIRECTORY, env);

  if (typeof loader.setResourcePath === 'function') {
    loader.setResourcePath(textureUrl);
  }

  if (typeof loader.setPath === 'function') {
    loader.setPath(resolveAssetUrl('assets/models/', env));
  }

  if (typeof loader.setCrossOrigin === 'function') {
    loader.setCrossOrigin('anonymous');
  }

  let gltf: GLTF;
  try {
    gltf = await loader.loadAsync(modelUrl);
  } catch (error) {
    throw formatLoadError(modelUrl, error);
  }

  const root = ensureScene(gltf);
  root.position.set(0, DEFAULT_BIRD_Y, 0);
  root.rotation.y = DEFAULT_BIRD_ROTATION_Y;
  root.scale.setScalar(DEFAULT_BIRD_SCALE);

  const animations = Array.isArray(gltf.animations) ? gltf.animations : [];
  const mixer = prepareAnimation(root, animations);

  return {
    root,
    mixer,
    animations,
  };
}
