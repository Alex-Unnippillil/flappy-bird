export class Pipe {
  x: number;
  width: number;
  gapSize: number;
  canvasHeight: number;
  topHeight: number;
  passed: boolean;
  constructor(x: number, canvasHeight: number, gapSize: number);
  update(
    speed: number,
    bird: import('./Bird.js').Bird,
    onCollision: () => void,
    onPass: () => void,
  ): void;
  draw(ctx: CanvasRenderingContext2D): void;
  isOffScreen(): boolean;
}
