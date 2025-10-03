export class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.velocity = 0;
    this.isInvincible = false;
  }

  jump() {
    this.velocity = -10;
  }

  update(gravity) {
    this.velocity += gravity;
    this.y += this.velocity;
  }

  draw(ctx) {
    ctx.save();

    if (this.isInvincible) {
      ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#FFD54F";
    } else {
      ctx.fillStyle = "#FF0000";
    }

    ctx.fillRect(this.x, this.y, this.width, this.height);

    if (this.isInvincible) {
      ctx.strokeStyle = "rgba(255, 235, 59, 0.9)";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }

    ctx.restore();
  }

  isOutOfBounds(canvasHeight) {
    return this.y < 0 || this.y + this.height > canvasHeight;
  }
}
