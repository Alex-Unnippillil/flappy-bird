import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AnimationClip, Group } from 'three';

const loadAsyncMock = vi.fn();
const setResourcePathMock = vi.fn();
const setPathMock = vi.fn();
const setCrossOriginMock = vi.fn();

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => {
  class MockGLTFLoader {
    loadAsync = loadAsyncMock;
    setResourcePath = setResourcePathMock;
    setPath = setPathMock;
    setCrossOrigin = setCrossOriginMock;
  }

  return {
    GLTFLoader: MockGLTFLoader,
  };
});

import { loadBird } from '../assets';

describe('loadBird', () => {
  beforeEach(() => {
    loadAsyncMock.mockReset();
    setResourcePathMock.mockReset();
    setPathMock.mockReset();
    setCrossOriginMock.mockReset();
  });

  it('throws when the feature flag is disabled', async () => {
    await expect(loadBird({ env: { VITE_FF_F06: 'false' } })).rejects.toThrowError(
      /feature flag VITE_FF_F06 is disabled/i,
    );
  });

  it('configures the loader with GitHub Pages base paths', async () => {
    const group = new Group();
    const animation = new AnimationClip('Flap', -1, []);

    loadAsyncMock.mockResolvedValueOnce({
      scene: group,
      animations: [animation],
    });

    const result = await loadBird({
      env: { VITE_FF_F06: 'true', BASE_URL: '/flappy-bird/' },
    });

    expect(setResourcePathMock).toHaveBeenCalledWith('/flappy-bird/assets/textures/');
    expect(setPathMock).toHaveBeenCalledWith('/flappy-bird/assets/models/');
    expect(setCrossOriginMock).toHaveBeenCalledWith('anonymous');
    expect(loadAsyncMock).toHaveBeenCalledWith('/flappy-bird/assets/models/bird.glb');
    expect(result.root).toBe(group);
    expect(result.mixer).not.toBeNull();
  });

  it('wraps loader failures with descriptive errors', async () => {
    loadAsyncMock.mockRejectedValueOnce(new Error('Not Found'));

    await expect(
      loadBird({ env: { VITE_FF_F06: 'true', BASE_URL: '/flappy-bird/' } }),
    ).rejects.toThrowError(/generate_bird_assets\.py/i);
  });
});
