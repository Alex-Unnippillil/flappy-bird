export class Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.velocity = 0;
  }

  jump(): void {
    this.velocity = -10;
  }

  update(gravity: number): void {
    this.velocity += gravity;
    this.y += this.velocity;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isOutOfBounds(canvasHeight: number): boolean {
    return this.y < 0 || this.y + this.height > canvasHeight;
  }
}
