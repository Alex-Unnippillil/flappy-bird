/**
 * Defines the shared contract for asset loader drivers (audio, images, etc.).
 *
 * Role
 * - Wraps source URL tracking and load completion bookkeeping that concrete loaders rely on to
 *   signal when all relevant events have fired.
 * - Exposes an abstract `test`/`load` interface so `AssetsLoader` can select the appropriate driver
 *   at runtime without knowing the implementation details.
 *
 * Inputs & Outputs
 * - Constructor accepts the asset source path; subclasses call `eventTracking` until all required
 *   events resolve the promise with `{ source, object }`.
 * - Static `regexp` on subclasses is used by the registry to match file extensions.
 *
 * Implementation Notes
 * - `eventTracking` decrements the expected ready count and resolves once the loader-specific
 *   events (e.g., `load`, `canplay`) finish firing.
 */
import { IPromiseResolve } from './interfaces';

class ParentLoader {
  private __source: string;
  protected ready: number; // Event to listen

  constructor(source: string) {
    this.__source = source;
    this.ready = 0;
  }

  protected eventTracking<T>(resolve: IEmptyFunction, object: T): void {
    this.ready--;

    if (this.ready < 1) {
      resolve({
        source: this.source,
        object: object
      });
    }
  }

  public get source(): string {
    return this.__source;
  }
}

/**
 * Making Parent Class to be extendable only
 * */
abstract class Loader extends ParentLoader {
  public static regexp: RegExp;
  public abstract test(): boolean;
  public abstract load(): Promise<IPromiseResolve>;
}

export { Loader as AbstractLoader };
