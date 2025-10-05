/**
 * Loader implementation for image assets.
 *
 * Role
 * - Complements `loaders/audio.ts` by handling `<img>` creation and load/error events.
 * - Shares the abstract loader contract so `AssetsLoader` can manage heterogeneous asset types
 *   uniformly.
 *
 * Inputs & Outputs
 * - `test()`: verifies the source filename matches supported image extensions.
 * - `load()`: resolves with `{ source, object: HTMLImageElement }` once the image is ready to use.
 *
 * Implementation Notes
 * - Only waits for the `load` event (images do not expose additional readiness events) and relies
 *   on the base `eventTracking` helper to notify the orchestrator when complete.
 */
import { IPromiseResolve } from '../interfaces';
import { AbstractLoader } from '../abstraction';

export default class ImageLoader extends AbstractLoader {
  public static regexp = /\.(jpe?g|png|svg|bmp|webp|webm|gif)/i;

  public test(): boolean {
    return ImageLoader.regexp.test(this.source);
  }

  public load(): Promise<IPromiseResolve> {
    // Load Event Count
    this.ready = 1;

    return new Promise<IPromiseResolve>((resolve: IEmptyFunction, reject) => {
      const img = new Image();

      /**
       * Fully loaded
       * */
      img.addEventListener('load', () => {
        this.eventTracking<HTMLImageElement>(resolve, img);
      });

      img.addEventListener('error', reject);

      img.src = this.source;
    });
  }
}
