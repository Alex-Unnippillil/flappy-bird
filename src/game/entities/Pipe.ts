import type { Bird } from "./Bird";

export class Pipe {
  public x: number;

  public readonly width: number;

  public readonly gapSize: number;

  private readonly canvasHeight: number;

  private readonly topHeight: number;

  private passed: boolean;

  constructor(x: number, canvasHeight: number, gapSize: number) {
    this.x = x;
    this.width = 50;
    this.gapSize = gapSize;
    this.canvasHeight = canvasHeight;
    this.passed = false;

    const minHeight = 50;
    const maxHeight = Math.max(minHeight, canvasHeight - gapSize - minHeight);
    this.topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  }

  update(
    speed: number,
    bird: Bird,
    onCollision: () => void,
    onPass: () => void,
  ): void {
    this.x -= speed;

    const birdWithinXRange = bird.x < this.x + this.width && bird.x + bird.width > this.x;
    const hitsTop = bird.y < this.topHeight;
    const hitsBottom = bird.y + bird.height > this.topHeight + this.gapSize;

    if (birdWithinXRange && (hitsTop || hitsBottom)) {
      onCollision();
    }

    if (!this.passed && bird.x > this.x + this.width) {
      this.passed = true;
      onPass();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(this.x, 0, this.width, this.topHeight);

    const bottomY = this.topHeight + this.gapSize;
    const bottomHeight = this.canvasHeight - bottomY;
    ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}
