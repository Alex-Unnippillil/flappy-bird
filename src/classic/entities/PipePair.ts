import {
  PIPE_GAP_SIZE,
  PIPE_HEIGHT,
  PIPE_MIN_GAP,
  PIPE_WIDTH,
} from '../constants';
import type { Dimension } from '../types';
import type { SpriteName, SpriteSheet } from '../spriteSheet';

const PIPE_MAIN = '#7dd36f';
const PIPE_DARK = '#3a7c47';

export type PipeColor = 'green' | 'red';

const PIPE_SPRITES: Record<PipeColor, { top: SpriteName; bottom: SpriteName }> = {
  green: { top: 'pipe-green-top', bottom: 'pipe-green-bottom' },
  red: { top: 'pipe-red-top', bottom: 'pipe-red-bottom' },
};

export class PipePair {
  private passed = false;
  private spriteSheet: SpriteSheet | null = null;
  private color: PipeColor = 'green';
  constructor(
    private readonly canvasSize: Dimension,
    private readonly platformHeight: number,
    public x: number,
    public gapCenter: number
  ) {}

  get width(): number {
    return this.canvasSize.width * (PIPE_WIDTH / 288);
  }

  get gapHeight(): number {
    return this.canvasSize.height * PIPE_GAP_SIZE;
  }

  setSpriteSheet(sheet: SpriteSheet | null): void {
    this.spriteSheet = sheet;
  }

  setColor(color: PipeColor): void {
    this.color = color;
  }

  update(deltaFrames: number, speedPerFrame: number): void {
    this.x -= speedPerFrame * deltaFrames;
  }

  isOffscreen(): boolean {
    return this.x + this.width / 2 < -this.width;
  }

  markPassed(): void {
    this.passed = true;
  }

  hasBeenPassed(): boolean {
    return this.passed;
  }

  collides(bounds: { left: number; right: number; top: number; bottom: number }): boolean {
    const gapTop = this.gapCenter - this.gapHeight / 2;
    const gapBottom = this.gapCenter + this.gapHeight / 2;

    const withinX =
      bounds.right > this.x - this.width / 2 && bounds.left < this.x + this.width / 2;

    if (!withinX) {
      return false;
    }

    if (bounds.top < gapTop) {
      return true;
    }

    if (bounds.bottom > gapBottom) {
      return true;
    }

    return false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const pipeWidth = this.width;
    const scale = pipeWidth / PIPE_WIDTH;
    const pipeHeight = PIPE_HEIGHT * scale;
    const gapHalf = this.gapHeight / 2;
    const gapTop = this.gapCenter - gapHalf;
    const gapBottom = this.gapCenter + gapHalf;

    if (this.spriteSheet) {
      const sprites = PIPE_SPRITES[this.color];
      const left = this.x - pipeWidth / 2;
      this.spriteSheet.draw(ctx, sprites.top, left, gapTop - pipeHeight, pipeWidth, pipeHeight);
      this.spriteSheet.draw(ctx, sprites.bottom, left, gapBottom, pipeWidth, pipeHeight);
      return;
    }

    ctx.save();
    ctx.fillStyle = PIPE_MAIN;
    ctx.strokeStyle = PIPE_DARK;
    ctx.lineWidth = pipeWidth * 0.12;

    // Upper pipe
    this.drawPipe(ctx, this.x - pipeWidth / 2, gapTop - pipeHeight, pipeWidth, pipeHeight, true);

    // Lower pipe
    this.drawPipe(ctx, this.x - pipeWidth / 2, gapBottom, pipeWidth, pipeHeight, false);

    ctx.restore();
  }

  private drawPipe(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    inverted: boolean
  ): void {
    const capHeight = height * 0.18;
    const bodyHeight = height - capHeight;

    ctx.fillRect(x, y + (inverted ? 0 : capHeight), width, bodyHeight);
    ctx.strokeRect(x, y + (inverted ? 0 : capHeight), width, bodyHeight);

    const capX = x - width * 0.05;
    const capY = y + (inverted ? bodyHeight : 0) - capHeight;
    const capWidth = width * 1.1;
    const radius = width * 0.12;

    ctx.beginPath();
    ctx.moveTo(capX + radius, capY);
    ctx.lineTo(capX + capWidth - radius, capY);
    ctx.quadraticCurveTo(capX + capWidth, capY, capX + capWidth, capY + radius);
    ctx.lineTo(capX + capWidth, capY + capHeight - radius);
    ctx.quadraticCurveTo(capX + capWidth, capY + capHeight, capX + capWidth - radius, capY + capHeight);
    ctx.lineTo(capX + radius, capY + capHeight);
    ctx.quadraticCurveTo(capX, capY + capHeight, capX, capY + capHeight - radius);
    ctx.lineTo(capX, capY + radius);
    ctx.quadraticCurveTo(capX, capY, capX + radius, capY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export function randomGapCenter(size: Dimension, platformHeight: number): number {
  const minGap = size.height * PIPE_MIN_GAP;
  const maxGap = size.height - platformHeight - minGap;
  const gapRange = Math.max(maxGap - minGap, 1);
  const gapCenter = minGap + Math.random() * gapRange;
  return gapCenter;
}
