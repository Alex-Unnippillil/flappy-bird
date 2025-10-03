import type { Bird } from "./Bird";

type RandomSource =
  | (() => number)
  | { next: () => number }
  | { nextInt: (min: number, max: number) => number };

function resolveRandomValue(source: RandomSource | undefined): number {
  if (typeof source === "function") {
    return source();
  }

  if (source && "next" in source && typeof source.next === "function") {
    return source.next();
  }

  return Math.random();
}

function randomIntInRange(source: RandomSource | undefined, min: number, max: number): number {
  if (max < min) {
    throw new Error("max must be greater than or equal to min");
  }

  if (source && "nextInt" in source && typeof source.nextInt === "function") {
    return source.nextInt(min, max);
  }

  const range = max - min + 1;
  const randomValue = resolveRandomValue(source);
  return Math.floor(randomValue * range) + min;
}

export class Pipe {
  public x: number;

  public readonly width: number;

  public readonly gapSize: number;

  public readonly canvasHeight: number;

  public readonly topHeight: number;

  private passed: boolean;

  constructor(x: number, canvasHeight: number, gapSize: number, randomSource: RandomSource | undefined = Math.random) {
    this.x = x;
    this.width = 50;
    this.gapSize = gapSize;
    this.canvasHeight = canvasHeight;
    this.passed = false;

    const minHeight = 50;
    const maxHeight = Math.max(minHeight, canvasHeight - gapSize - minHeight);
    this.topHeight = randomIntInRange(randomSource, minHeight, maxHeight);
  }

  update(speed: number, bird: Bird, onCollision: () => void, onPass: () => void): void {
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
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(this.x, 0, this.width, this.topHeight);

    const bottomY = this.topHeight + this.gapSize;
    const bottomHeight = this.canvasHeight - bottomY;
    ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}
