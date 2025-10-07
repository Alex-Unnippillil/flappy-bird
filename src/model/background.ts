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

  private gradientCache: Map<ITheme, { gradient: CanvasGradient; height: number }>;
  private hazeCache: Map<ITheme, { gradient: CanvasGradient; height: number }>;

  private readonly palette: Record<
    ITheme,
    {
      base: string;
      gradient: [string, string];
      haze: { start: string; end: string };
      overlayAlpha: number;
      hazeAlpha: number;
    }
  >;

  constructor() {
    super();
    this.images = new Map<ITheme, HTMLImageElement>();
    this.theme = 'day';

    this.velocity.x = BG_SPEED;

    this.backgroundSize = {
      width: 0,
      height: 0
    };

    this.gradientCache = new Map();
    this.hazeCache = new Map();

    this.palette = {
      day: {
        base: '#cde7ff',
        gradient: ['#8ecfff', '#ecf7ff'],
        haze: {
          start: 'rgba(206, 226, 255, 0.55)',
          end: 'rgba(206, 226, 255, 0)'
        },
        overlayAlpha: 0.6,
        hazeAlpha: 0.45
      },
      night: {
        base: '#1a233f',
        gradient: ['#121a33', '#2c3857'],
        haze: {
          start: 'rgba(112, 136, 188, 0.5)',
          end: 'rgba(112, 136, 188, 0)'
        },
        overlayAlpha: 0.7,
        hazeAlpha: 0.4
      }
    };
  }

  /**
   * Initialize Images after all asset has been loaded
   * */
  public init(): void {
    this.images.set('day', SpriteDestructor.asset('theme-day'));
    this.images.set('night', SpriteDestructor.asset('theme-night'));

    Object.assign(SceneGenerator.bgThemeList, ['day', 'night']);
    this.use(SceneGenerator.background);
  }

  public reset(): void {
    this.coordinate = { x: 0, y: 0 };
    this.resize(this.canvasSize);
    this.use(SceneGenerator.background);
  }

  /**
   * Select either day and night
   * */
  public use(select: ITheme): void {
    this.theme = select;
  }

  /**
   * Resize Background image while Keeping the same ratio
   * */
  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.backgroundSize = rescaleDim(
      {
        width: this.images.get(this.theme)!.width,
        height: this.images.get(this.theme)!.height
      },
      { height }
    );
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
  }

  public Display(context: CanvasRenderingContext2D): void {
    const { width, height } = this.backgroundSize;
    const { x, y } = this.coordinate;

    const palette = this.palette[this.theme];

    context.save();
    context.fillStyle = palette.base;
    context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    context.restore();

    // Get how many sequence we need to fill the screen
    const sequence = Math.ceil(this.canvasSize.width / width) + 1;

    // Keep the images on screen.
    // X coordinate may gave us -99999999 values
    // But using modulo we're just getting -width of an image
    const offset = x % width;

    // Draw the background next to each other in given sequence
    for (let i = 0; i < sequence; i++) {
      context.drawImage(
        this.images.get(this.theme)!,
        i * width - offset,
        y,
        width,
        height
      );
    }

    const bgGradient = this.getGradient(context);

    context.save();
    context.globalAlpha = palette.overlayAlpha;
    context.globalCompositeOperation = 'soft-light';
    context.fillStyle = bgGradient;
    context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    context.restore();

    const hazeGradient = this.getHaze(context);
    const hazeStart = this.canvasSize.height * 0.35;
    const hazeHeight = this.canvasSize.height - hazeStart;

    context.save();
    context.globalAlpha = palette.hazeAlpha;
    context.globalCompositeOperation = 'screen';
    context.fillStyle = hazeGradient;
    context.fillRect(0, hazeStart, this.canvasSize.width, hazeHeight);
    context.restore();
  }

  private getGradient(context: CanvasRenderingContext2D): CanvasGradient {
    const cached = this.gradientCache.get(this.theme);
    const { gradient } = this.palette[this.theme];
    const { height } = this.canvasSize;

    if (!cached || cached.height !== height) {
      const grad = context.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, gradient[0]);
      grad.addColorStop(1, gradient[1]);
      this.gradientCache.set(this.theme, { gradient: grad, height });
      return grad;
    }

    return cached.gradient;
  }

  private getHaze(context: CanvasRenderingContext2D): CanvasGradient {
    const cached = this.hazeCache.get(this.theme);
    const { haze } = this.palette[this.theme];
    const { height } = this.canvasSize;
    const start = height * 0.35;
    const end = height * 0.9;

    if (!cached || cached.height !== height) {
      const grad = context.createLinearGradient(0, start, 0, end);
      grad.addColorStop(0, haze.start);
      grad.addColorStop(1, haze.end);
      this.hazeCache.set(this.theme, { gradient: grad, height });
      return grad;
    }

    return cached.gradient;
  }
}
