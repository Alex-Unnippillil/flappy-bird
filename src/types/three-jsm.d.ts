declare module 'three/examples/jsm/loaders/DRACOLoader.js' {
  export class DRACOLoader {
    constructor();
    setDecoderPath(path: string): this;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type { AnimationClip, Group, Loader, LoadingManager } from 'three';
  import type { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

  export interface GLTF {
    scene: Group;
    scenes: Group[];
    animations: AnimationClip[];
    parser: unknown;
    asset: Record<string, unknown>;
    userData: Record<string, unknown>;
  }

  export class GLTFLoader extends Loader<GLTF> {
    constructor(manager?: LoadingManager);
    loadAsync(url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void): Promise<GLTF>;
    setDRACOLoader(loader: DRACOLoader): this;
  }
}

declare module 'three/examples/jsm/utils/SkeletonUtils.js' {
  import type { Group, Object3D } from 'three';

  export function clone<T extends Object3D>(source: T): T;
  export function clone(source: Group): Group;
}
