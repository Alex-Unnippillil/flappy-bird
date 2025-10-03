import { Group } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { clone as cloneWithSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

/**
 * Default locations for core game models. These are intentionally exported so callers can
 * build UIs that reference the same canonical asset paths.
 */
export const MODEL_URLS = Object.freeze({
  bird: '/assets/models/bird.glb',
  pipe: '/assets/models/pipe.glb',
  background: '/assets/models/background.glb',
});

const gltfCache = new Map<string, Promise<GLTF>>();

let sharedLoader: GLTFLoader | null = null;
let sharedDracoLoader: DRACOLoader | null = null;

function getLoader(): GLTFLoader {
  if (sharedLoader) {
    return sharedLoader;
  }

  sharedLoader = new GLTFLoader();

  // Configure optional Draco compression support if the decoder is available at runtime.
  if (typeof window !== 'undefined') {
    sharedDracoLoader = new DRACOLoader();
    // The decoder path is relative to the built output. Projects that do not ship the Draco
    // decoder can simply omit the files without breaking non-compressed assets.
    sharedDracoLoader.setDecoderPath('/assets/draco/');
    sharedLoader.setDRACOLoader(sharedDracoLoader);
  }

  return sharedLoader;
}

async function loadGLTF(url: string): Promise<GLTF> {
  let promise = gltfCache.get(url);
  if (!promise) {
    promise = getLoader().loadAsync(url);
    gltfCache.set(url, promise);
  }

  return promise;
}

function cloneScene(scene: GLTF['scene']): Group {
  // SkeletonUtils.clone preserves skinning/bone hierarchies while also handling shared
  // geometries, which is important for animated bird rigs.
  return cloneWithSkeleton(scene) as Group;
}

/**
 * Preloads and caches a GLTF scene, allowing renderers to request cloned copies without
 * incurring multiple network requests.
 */
export async function preloadScene(url: string): Promise<void> {
  await loadGLTF(url);
}

/**
 * Loads a GLTF scene and returns a cloned instance that can be safely mutated by the caller
 * without affecting the cached original.
 */
export async function getSceneClone(url: string): Promise<Group> {
  const gltf = await loadGLTF(url);
  return cloneScene(gltf.scene);
}

/**
 * Convenience helper for retrieving cloned core game assets.
 */
export const loadCoreModel = {
  bird: () => getSceneClone(MODEL_URLS.bird),
  pipe: () => getSceneClone(MODEL_URLS.pipe),
  background: () => getSceneClone(MODEL_URLS.background),
} as const;

/**
 * Clears cached GLTF data. This is primarily useful for tests where we need to verify caching
 * behaviour deterministically.
 */
export function clearSceneCache(): void {
  gltfCache.clear();
}

/**
 * Disposes loader resources. Generally only needed in test environments.
 */
export function disposeLoaders(): void {
  gltfCache.clear();

  if (sharedDracoLoader) {
    sharedDracoLoader.dispose?.();
    sharedDracoLoader = null;
  }

  sharedLoader = null;
}
