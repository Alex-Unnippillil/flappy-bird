declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type { AnimationClip, Group } from 'three';

  export interface GLTF {
    scene: Group;
    scenes?: Group[];
    animations: AnimationClip[];
  }

  export class GLTFLoader {
    constructor(manager?: unknown);
    loadAsync(url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void): Promise<GLTF>;
    setDRACOLoader(loader: unknown): this;
    setResourcePath(path: string): this;
    setPath(path: string): this;
    setCrossOrigin(value: string): this;
  }
}

declare module 'three/examples/jsm/loaders/DRACOLoader.js' {
  export class DRACOLoader {
    setDecoderPath(path: string): this;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/utils/SkeletonUtils.js' {
  import type { Object3D } from 'three';

  export function clone<T extends Object3D>(source: T): T;
}
