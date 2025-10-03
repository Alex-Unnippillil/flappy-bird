export class Pipe {
  constructor(x, canvasHeight, gapSize) {
    this.x = x;
    this.width = 50;
    this.gapSize = gapSize;
    this.canvasHeight = canvasHeight;
    this.passed = false;

    const minHeight = 50;
    const maxHeight = Math.max(minHeight, canvasHeight - gapSize - minHeight);
    this.topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  }

  update(speed, bird, onCollision, onPass) {
    this.x -= speed;

    const contactPoints = [];

    const birdWithinXRange = bird.x < this.x + this.width && bird.x + bird.width > this.x;
    const hitsTop = bird.y < this.topHeight;
    const hitsBottom = bird.y + bird.height > this.topHeight + this.gapSize;

    if (birdWithinXRange) {
      if (hitsTop) {
        const topContact = this.calculateContactPoint(bird, true);
        if (topContact) {
          contactPoints.push(topContact);
        }
      }

      if (hitsBottom) {
        const bottomContact = this.calculateContactPoint(bird, false);
        if (bottomContact) {
          contactPoints.push(bottomContact);
        }
      }

      if (contactPoints.length > 0) {
        onCollision();
      }
    }

    if (!this.passed && bird.x > this.x + this.width) {
      this.passed = true;
      onPass();
    }

    return contactPoints;
  }

  calculateContactPoint(bird, hitsTop) {
    const overlapLeft = Math.max(bird.x, this.x);
    const overlapRight = Math.min(bird.x + bird.width, this.x + this.width);

    if (overlapLeft >= overlapRight) {
      return null;
    }

    const centerX = (overlapLeft + overlapRight) / 2;

    if (hitsTop) {
      const y = Math.min(bird.y + bird.height, this.topHeight);
      return { x: centerX, y };
    }

    const bottomY = this.topHeight + this.gapSize;
    const y = Math.max(bird.y, bottomY);
    return { x: centerX, y };
  }

  draw(ctx) {
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(this.x, 0, this.width, this.topHeight);

    const bottomY = this.topHeight + this.gapSize;
    const bottomHeight = this.canvasHeight - bottomY;
    ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}
