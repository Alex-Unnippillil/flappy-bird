export class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.velocity = 0;
  }

  jump() {
    this.velocity = -10;
  }

  update(gravity, motionScale = 1) {
    const scale = motionScale ?? 1;
    this.velocity += gravity * scale;
    this.y += this.velocity * scale;
  }

  draw(ctx) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isOutOfBounds(canvasHeight) {
    return this.y < 0 || this.y + this.height > canvasHeight;
  }
}
