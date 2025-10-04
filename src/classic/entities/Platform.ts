import { CANVAS_HEIGHT, PLATFORM_HEIGHT } from '../constants.ts';
import type { Dimension } from '../types.ts';

const TOP_COLOR = '#ded48a';
const FRONT_COLOR = '#c4a34a';
const STRIPE_COLOR = '#b48a2c';

export class Platform {
  private offset = 0;
  private height = 0;

  constructor(private readonly canvasSize: Dimension) {
    this.resize(canvasSize);
  }

  resize(size: Dimension): void {
    this.height = size.height * (PLATFORM_HEIGHT / CANVAS_HEIGHT);
  }

  update(deltaFrames: number, speedPerFrame: number): void {
    this.offset = (this.offset + speedPerFrame * deltaFrames) % this.canvasSize.width;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.canvasSize;
    const y = height - this.height;

    ctx.save();
    ctx.fillStyle = TOP_COLOR;
    ctx.fillRect(0, y, width, this.height * 0.6);

    ctx.fillStyle = FRONT_COLOR;
    ctx.fillRect(0, y + this.height * 0.6, width, this.height * 0.4);

    const stripeWidth = this.height * 0.3;
    const offset = this.offset % stripeWidth;

    ctx.fillStyle = STRIPE_COLOR;
    for (let x = -stripeWidth; x < width + stripeWidth; x += stripeWidth) {
      const drawX = x - offset;
      ctx.fillRect(drawX, y + this.height * 0.6, stripeWidth * 0.5, this.height * 0.4);
    }

    ctx.restore();
  }

  getHeight(): number {
    return this.height;
  }
}
