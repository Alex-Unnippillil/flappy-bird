/**
 * Coordinates loading of external assets (images, audio) through registered loader drivers.
 *
 * Role
 * - Accepts a list of asset URLs, selects the appropriate loader (`audio`, `image`, etc.), and
 *   caches the resulting DOM objects for later retrieval.
 * - Provides a simple promise-like `then` API that fires once all assets are ready so game screens
 *   can begin rendering.
 *
 * Inputs & Outputs
 * - Constructor receives an array of source strings and kicks off loading immediately.
 * - `then(callback)`: invoked when all requested assets resolve.
 * - `get(key)`: returns the cached asset instance (`HTMLImageElement` or `HTMLAudioElement`).
 *
 * Implementation Notes
 * - Iterates over the loader registry defined in `loaders/` to find a driver whose `test` method
 *   matches the source path extension.
 * - Stores assets in a static map so subsequent calls can fetch them without reloading.
 */
import AudioLoader from './loaders/audio';
import ImageLoader from './loaders/image';
import { IPromiseResolve, ILoaders } from './interfaces';

export type IAssets = HTMLImageElement | HTMLAudioElement;

export default class AssetsLoader {
  private static assets: Map<string, IAssets> = new Map<string, IAssets>();
  private callback?: IEmptyFunction;
  private static loaders: ILoaders[] = [AudioLoader, ImageLoader];

  constructor(sources: string[]) {
    const InitializeLoad = sources.map((source: string) => {
      for (const loader of AssetsLoader.loaders) {
        const instance = new loader(source);

        if (instance.test()) {
          return instance.load();
        }
      }

      /**
       * Throw if no available driver to handle the requests
       * */

      throw new Error('No available driver for file: ' + source);
    });

    Promise.all(InitializeLoad)
      .then((resolveArray: IPromiseResolve[]) => {
        resolveArray.forEach((resolve: IPromiseResolve) => {
          AssetsLoader.assets.set(resolve.source, resolve.object as IAssets);
        });

        this.callback?.();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Call the instance function after all assets has been loaded
  then(callback: IEmptyFunction): void {
    this.callback = callback;
  }

  static get<T>(source: string): T {
    return AssetsLoader.assets.get(source) as T;
  }
}

// export const asset = AssetsLoader.get;
