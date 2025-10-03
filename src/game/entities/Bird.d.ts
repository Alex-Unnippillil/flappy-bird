export class Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
  constructor(x: number, y: number);
  jump(): void;
  update(gravity: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  isOutOfBounds(canvasHeight: number): boolean;
}
