import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('three/examples/jsm/loaders/DRACOLoader.js', () => ({
  __esModule: true,
  DRACOLoader: class {
    setDecoderPath() {
      // noop for tests
    }
    dispose() {
      // noop for tests
    }
  },
}));

const loadSpy = vi.fn(async (url: string) => ({
  scene: { url },
}));

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  __esModule: true,
  GLTFLoader: class {
    loadAsync(url: string) {
      return loadSpy(url);
    }
    setDRACOLoader() {
      // noop for tests
    }
  },
  GLTF: {} as unknown,
}));

vi.mock('three/examples/jsm/utils/SkeletonUtils.js', () => ({
  __esModule: true,
  clone: (scene: { url: string }) => ({
    url: scene.url,
    cloned: true,
    timestamp: Symbol(scene.url),
  }),
}));

vi.mock('three', () => ({
  __esModule: true,
  Group: class {},
}));

import {
  MODEL_URLS,
  clearSceneCache,
  disposeLoaders,
  getSceneClone,
  loadCoreModel,
  preloadScene,
} from './assets';

describe('three asset loader cache', () => {
  beforeEach(() => {
    clearSceneCache();
    loadSpy.mockClear();
  });

  it('loads a scene once and returns cloned instances on subsequent requests', async () => {
    const first = (await getSceneClone('mock.glb')) as { cloned?: boolean };
    const second = (await getSceneClone('mock.glb')) as { cloned?: boolean };

    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(first).not.toBe(second);
    expect(first.cloned).toBe(true);
    expect(second.cloned).toBe(true);
  });

  it('shares cached data between preload and clone helpers', async () => {
    await preloadScene(MODEL_URLS.bird);
    const birdClone = (await loadCoreModel.bird()) as { cloned?: boolean };

    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(birdClone.cloned).toBe(true);
  });
});

afterAll(() => {
  disposeLoaders();
});
