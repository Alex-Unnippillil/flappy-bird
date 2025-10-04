import { BG_SPEED } from '../constants.ts';
import type { Dimension } from '../types.ts';

type Theme = 'day' | 'night';

const THEMES: Record<Theme, { sky: [string, string]; hill: string; cloud: string }> = {
  day: {
    sky: ['#74c7ff', '#d0f4ff'],
    hill: '#7bd66f',
    cloud: '#ffffff',
  },
  night: {
    sky: ['#041b3b', '#124972'],
    hill: '#1f4c3b',
    cloud: '#dde6ff',
  },
};

export class Background {
  private offset = 0;
  private theme: Theme = 'day';
  private cloudSeed = Math.random();

  constructor(private readonly canvasSize: Dimension) {
    this.chooseTheme();
  }

  chooseTheme(): void {
    this.theme = Math.random() > 0.5 ? 'day' : 'night';
    this.cloudSeed = Math.random();
  }

  update(deltaFrames: number, speedPerFrame: number): void {
    const scrollSpeed = speedPerFrame > 0 ? speedPerFrame : BG_SPEED * this.canvasSize.width;
    this.offset = (this.offset + scrollSpeed * deltaFrames) % this.canvasSize.width;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.canvasSize;
    const theme = THEMES[this.theme];

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, theme.sky[0]);
    gradient.addColorStop(1, theme.sky[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    this.drawClouds(ctx, theme.cloud);
    this.drawHills(ctx, theme.hill);
  }

  private drawClouds(ctx: CanvasRenderingContext2D, color: string): void {
    const { width, height } = this.canvasSize;
    const baseOffset = (this.offset * 0.6) % width;
    const cloudCount = 4;
    const cloudHeight = height * 0.12;

    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;

    for (let i = -1; i < cloudCount; i += 1) {
      const normalized = (i + this.cloudSeed) / cloudCount;
      const x = (normalized * width + width - baseOffset) % (width + cloudHeight) - cloudHeight;
      const y = height * 0.12 + Math.sin(normalized * Math.PI * 2) * height * 0.04;
      this.drawCloud(ctx, x, y, cloudHeight * (0.7 + (normalized % 0.3)));
    }

    ctx.restore();
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.4, y + size * 0.1, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
    ctx.ellipse(x - size * 0.3, y + size * 0.15, size * 0.4, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHills(ctx: CanvasRenderingContext2D, color: string): void {
    const { width, height } = this.canvasSize;
    const hillHeight = height * 0.28;
    const baseOffset = this.offset % width;

    ctx.save();
    ctx.fillStyle = color;

    for (let x = -width; x < width * 2; x += width) {
      const drawX = x - baseOffset;
      ctx.beginPath();
      ctx.moveTo(drawX, height);
      ctx.quadraticCurveTo(drawX + width * 0.25, height - hillHeight, drawX + width * 0.5, height - hillHeight * 0.6);
      ctx.quadraticCurveTo(drawX + width * 0.75, height - hillHeight * 0.2, drawX + width, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
