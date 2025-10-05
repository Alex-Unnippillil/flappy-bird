// File Overview: This module belongs to src/model/background.ts.
import { BG_SPEED } from '../constants';
import { rescaleDim } from '../utils';
import ParentClass from '../abstracts/parent-class';
import SpriteDestructor from '../lib/sprite-destructor';
import SceneGenerator from './scene-generator';

export type ITheme = string;
export type IRecords = Map<ITheme, HTMLImageElement>;
export default class Background extends ParentClass {
  /**
   * background dimension.
   * */
  private backgroundSize: IDimension;

  private images: IRecords;
  private theme: ITheme;
  private pendingTheme: ITheme | null;
  private sizes: Map<ITheme, IDimension>;
  private transition: {
    active: boolean;
    from: ITheme;
    to: ITheme;
    start: number;
    progress: number;
    duration: number;
  };

  constructor() {
    super();
    this.images = new Map<ITheme, HTMLImageElement>();
    this.theme = 'day';
    this.pendingTheme = null;
    this.sizes = new Map<ITheme, IDimension>();
    this.transition = {
      active: false,
      from: 'day',
      to: 'day',
      start: 0,
      progress: 1,
      duration: 1200
    };

    this.velocity.x = BG_SPEED;

    this.backgroundSize = {
      width: 0,
      height: 0
    };
  }

  /**
   * Initialize Images after all asset has been loaded
   * */
  public init(): void {
    this.images.set('day', SpriteDestructor.asset('theme-day'));
    this.images.set('night', SpriteDestructor.asset('theme-night'));

    Object.assign(SceneGenerator.bgThemeList, ['day', 'night']);
    this.use(SceneGenerator.background, { immediate: true });
  }

  public reset(): void {
    this.coordinate = { x: 0, y: 0 };
    this.resize(this.canvasSize);
    this.use(SceneGenerator.background, { immediate: true });
  }

  /**
   * Select either day and night
   * */
  public use(select: ITheme, options: { immediate?: boolean } = {}): void {
    const immediate = options.immediate ?? false;

    if (immediate) {
      this.theme = select;
      this.pendingTheme = null;
      this.transition.active = false;
      this.transition.progress = 1;
      this.transition.from = select;
      this.transition.to = select;
      this.updateSizeCache();
      return;
    }

    if (this.theme === select && !this.transition.active) return;

    this.pendingTheme = select;
    this.transition = {
      active: true,
      from: this.theme,
      to: select,
      start: this.now(),
      progress: 0,
      duration: 1500
    };
  }

  /**
   * Resize Background image while Keeping the same ratio
   * */
  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.sizes.clear();
    this.backgroundSize = this.getSizeFor(this.theme);
  }

  public Update(): void {
    /**
     * We use linear interpolation instead of by pixel to move the object.
     * It is to keep the speed same in different Screen Sizes & Screen DPI.
     *
     * The only problem that left is the time difference.
     * We cannot rely on fps since it is not a constant value.
     * Which means is the game will speed up or slow down based on fps
     * */
    this.coordinate.x += this.canvasSize.width * this.velocity.x;
    this.coordinate.y += this.velocity.y;

    this.updateTransition();
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (this.transition.active && this.pendingTheme) {
      this.drawTheme(context, this.transition.from, 1 - this.transition.progress);
      this.drawTheme(context, this.transition.to, this.transition.progress);
      return;
    }

    this.drawTheme(context, this.theme, 1);
  }

  private drawTheme(context: CanvasRenderingContext2D, theme: ITheme, alpha: number): void {
    if (alpha <= 0) return;

    const { width, height } = this.getSizeFor(theme);
    const { x, y } = this.coordinate;
    const sequence = Math.ceil(this.canvasSize.width / width) + 1;
    const offset = x % width;

    context.save();
    context.globalAlpha = alpha;

    for (let i = 0; i < sequence; i++) {
      context.drawImage(
        this.images.get(theme)!,
        i * (width - i) - offset,
        y,
        width,
        height
      );
    }

    context.restore();
  }

  private updateTransition(): void {
    if (!this.transition.active || !this.pendingTheme) return;

    const elapsed = this.now() - this.transition.start;
    const duration = Math.max(1, this.transition.duration);
    const progress = Math.min(1, elapsed / duration);

    this.transition.progress = this.easeInOut(progress);

    if (progress >= 1) {
      this.transition.active = false;
      this.theme = this.pendingTheme;
      this.pendingTheme = null;
      this.transition.progress = 1;
      this.updateSizeCache();
    }
  }

  private getSizeFor(theme: ITheme): IDimension {
    if (this.sizes.has(theme)) return this.sizes.get(theme)!;

    const image = this.images.get(theme);
    if (!image) return this.backgroundSize;

    const size = rescaleDim(
      { width: image.width, height: image.height },
      { height: this.canvasSize.height }
    );

    this.sizes.set(theme, size);
    return size;
  }

  private updateSizeCache(): void {
    if (!this.images.size) return;

    this.sizes.delete(this.theme);
    const size = this.getSizeFor(this.theme);
    this.backgroundSize = size;
  }

  private now(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }

    return Date.now();
  }

  private easeInOut(value: number): number {
    return value * value * (3 - 2 * value);
  }
}
