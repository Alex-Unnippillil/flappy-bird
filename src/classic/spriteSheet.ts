import atlasUrl from '../assets/atlas.png';

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

const FRAMES = {
  'theme-day': { x: 0, y: 0, width: 288, height: 512 },
  'theme-night': { x: 292, y: 0, width: 288, height: 512 },
  platform: { x: 584, y: 0, width: 236, height: 112 },
  'pipe-red-top': { x: 0, y: 646, width: 52, height: 320 },
  'pipe-red-bottom': { x: 56, y: 646, width: 52, height: 320 },
  'pipe-green-top': { x: 112, y: 646, width: 52, height: 320 },
  'pipe-green-bottom': { x: 168, y: 646, width: 52, height: 320 },
  'bird-yellow-up': { x: 6, y: 982, width: 34, height: 24 },
  'bird-yellow-mid': { x: 62, y: 982, width: 34, height: 24 },
  'bird-yellow-down': { x: 118, y: 982, width: 34, height: 24 },
  'bird-blue-up': { x: 174, y: 982, width: 34, height: 24 },
  'bird-blue-mid': { x: 230, y: 658, width: 34, height: 24 },
  'bird-blue-down': { x: 230, y: 710, width: 34, height: 24 },
  'bird-red-up': { x: 230, y: 762, width: 34, height: 24 },
  'bird-red-mid': { x: 230, y: 814, width: 34, height: 24 },
  'bird-red-down': { x: 230, y: 866, width: 34, height: 24 },
  'banner-game-ready': { x: 586, y: 118, width: 192, height: 58 },
  'banner-game-over': { x: 786, y: 118, width: 200, height: 52 },
  'banner-flappybird': { x: 702, y: 182, width: 178, height: 52 },
  'banner-instruction': { x: 584, y: 182, width: 114, height: 98 },
  'score-board': { x: 4, y: 516, width: 232, height: 123 },
  'toast-new': { x: 224, y: 1002, width: 32, height: 14 },
  'coin-dull-bronze': { x: 224, y: 954, width: 44, height: 44 },
  'coin-dull-metal': { x: 224, y: 906, width: 44, height: 44 },
  'coin-shine-gold': { x: 242, y: 564, width: 44, height: 44 },
  'coin-shine-silver': { x: 242, y: 516, width: 44, height: 44 },
  'number-lg-0': { x: 992, y: 120, width: 24, height: 36 },
  'number-lg-1': { x: 272, y: 910, width: 16, height: 36 },
  'number-lg-2': { x: 584, y: 320, width: 24, height: 36 },
  'number-lg-3': { x: 612, y: 320, width: 24, height: 36 },
  'number-lg-4': { x: 640, y: 320, width: 24, height: 36 },
  'number-lg-5': { x: 668, y: 320, width: 24, height: 36 },
  'number-lg-6': { x: 584, y: 368, width: 24, height: 36 },
  'number-lg-7': { x: 612, y: 368, width: 24, height: 36 },
  'number-lg-8': { x: 640, y: 368, width: 24, height: 36 },
  'number-lg-9': { x: 668, y: 368, width: 24, height: 36 },
  'number-md-0': { x: 274, y: 612, width: 14, height: 20 },
  'number-md-1': { x: 278, y: 954, width: 10, height: 20 },
  'number-md-2': { x: 274, y: 978, width: 14, height: 20 },
  'number-md-3': { x: 262, y: 1002, width: 14, height: 20 },
  'number-md-4': { x: 1004, y: 0, width: 14, height: 20 },
  'number-md-5': { x: 1004, y: 24, width: 14, height: 20 },
  'number-md-6': { x: 1010, y: 52, width: 14, height: 20 },
  'number-md-7': { x: 1010, y: 84, width: 14, height: 20 },
  'number-md-8': { x: 586, y: 484, width: 14, height: 20 },
  'number-md-9': { x: 622, y: 412, width: 14, height: 20 },
} as const;

export type SpriteName = keyof typeof FRAMES;

export class SpriteSheet {
  private constructor(private readonly image: HTMLImageElement) {}

  static async load(): Promise<SpriteSheet> {
    const image = await loadImage(atlasUrl);
    return new SpriteSheet(image);
  }

  draw(ctx: CanvasRenderingContext2D, name: SpriteName, x: number, y: number, width?: number, height?: number): void {
    const frame = FRAMES[name];
    const drawWidth = width ?? frame.width;
    const drawHeight = height ?? frame.height;
    ctx.drawImage(this.image, frame.x, frame.y, frame.width, frame.height, x, y, drawWidth, drawHeight);
  }

  getFrame(name: SpriteName): SpriteFrame {
    return FRAMES[name];
  }

  get imageElement(): HTMLImageElement {
    return this.image;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (event) => reject(event));
  });
}

export async function loadSpriteSheet(): Promise<SpriteSheet> {
  return SpriteSheet.load();
}
