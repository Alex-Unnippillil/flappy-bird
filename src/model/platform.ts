// File Overview: This module belongs to src/model/platform.ts.
import { rescaleDim } from '../utils';

import { GAME_SPEED } from '../constants';
import ParentClass from '../abstracts/parent-class';
import SpriteDestructor from '../lib/sprite-destructor';

export default class Platform extends ParentClass {
  public platformSize: IDimension;
  private img: undefined | HTMLImageElement;
  private styledPlatform: HTMLCanvasElement | null;

  constructor() {
    super();
    this.velocity.x = GAME_SPEED;
    this.platformSize = {
      width: 0,
      height: 0
    };
    this.img = void 0;
    this.styledPlatform = null;
  }

  public init() {
    this.img = SpriteDestructor.asset('platform');
  }

  public reset(): void {
    this.coordinate = { x: 0, y: 0 };
    this.resize(this.canvasSize);
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.platformSize = rescaleDim(
      {
        width: this.img!.width,
        height: this.img!.height
      },
      { height: height / 4 }
    );

    this.coordinate.y = height - this.platformSize.height;
    this.generateStyledPlatform();
  }

  public Update() {
    /**
     * We use linear interpolation instead of by pixel to move the object.
     * It is to keep the speed same in different Screen Sizes & Screen DPI
     * */
    this.coordinate.x += this.canvasSize.width * this.velocity.x;
    this.coordinate.y += this.velocity.y;
  }

  public Display(context: CanvasRenderingContext2D) {
    /**
     * Similar to the background but drawing the image into bottom of screen
     * */
    const { width, height } = this.platformSize;
    const { x, y } = this.coordinate;
    const sequence = Math.ceil(this.canvasSize.width / width) + 1;
    const offset = x % width;

    for (let i = 0; i < sequence; i++) {
      context.drawImage(
        this.styledPlatform ?? this.img!,
        i * width - offset,
        y,
        width,
        height
      );
    }
  }

  private generateStyledPlatform(): void {
    if (!this.img) return;

    const canvas = document.createElement('canvas');
    const width = Math.max(1, Math.round(this.platformSize.width));
    const height = Math.max(1, Math.round(this.platformSize.height));
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.styledPlatform = null;
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.img, 0, 0, width, height);

    const highlight = ctx.createLinearGradient(0, 0, 0, height);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    highlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.12)');
    highlight.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
    highlight.addColorStop(1, 'rgba(0, 0, 0, 0.18)');

    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    const edgeGlow = ctx.createLinearGradient(0, 0, width, 0);
    edgeGlow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    edgeGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    edgeGlow.addColorStop(1, 'rgba(255, 255, 255, 0.18)');

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = edgeGlow;
    ctx.fillRect(0, height * 0.12, width, height * 0.7);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const lipHighlight = ctx.createLinearGradient(0, 0, 0, height * 0.22);
    lipHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    lipHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = lipHighlight;
    ctx.fillRect(0, 0, width, height * 0.22);
    ctx.restore();

    const baseShadow = ctx.createLinearGradient(0, height * 0.68, 0, height);
    baseShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
    baseShadow.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = baseShadow;
    ctx.fillRect(0, height * 0.68, width, height * 0.32);
    ctx.restore();

    this.styledPlatform = canvas;
  }
}
