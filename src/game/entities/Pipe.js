function randomIntInRange(randomSource, min, max) {
  if (max < min) {
    throw new Error("max must be greater than or equal to min");
  }

  const range = max - min + 1;

  if (randomSource && typeof randomSource.nextInt === "function") {
    return randomSource.nextInt(min, max);
  }

  const randomValue = (() => {
    if (typeof randomSource === "function") {
      return randomSource();
    }

    if (randomSource && typeof randomSource.next === "function") {
      return randomSource.next();
    }

    return Math.random();
  })();

  return Math.floor(randomValue * range) + min;
}

export class Pipe {
  constructor(x, canvasHeight, gapSize, randomSource = Math.random) {
    this.x = x;
    this.width = 50;
    this.gapSize = gapSize;
    this.canvasHeight = canvasHeight;
    this.passed = false;

    const minHeight = 50;
    const maxHeight = Math.max(minHeight, canvasHeight - gapSize - minHeight);
    this.topHeight = randomIntInRange(randomSource, minHeight, maxHeight);
  }

  update(speed, bird, onCollision, onPass) {
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
