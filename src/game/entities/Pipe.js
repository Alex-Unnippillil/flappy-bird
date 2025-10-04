/**
 * @typedef {() => number} RandomFunction
 * @typedef {{ next: () => number }} NextMethodSource
 * @typedef {{ nextInt: (min: number, max: number) => number }} NextIntSource
 * @typedef {RandomFunction | NextMethodSource | NextIntSource} RandomSource
 */

/**
 * @param {RandomSource | undefined} randomSource
 * @param {number} min
 * @param {number} max
 */
function randomIntInRange(randomSource, min, max) {
  if (max < min) {
    throw new Error("max must be greater than or equal to min");
  }

  const range = max - min + 1;

  if (randomSource && typeof randomSource.int === "function") {
    return randomSource.int(min, max);
  }

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
  /**
   * @param {number} x
   * @param {number} playfieldHeight
   * @param {number} gapSize
   * @param {RandomSource} [randomSource]
   */
  constructor(x, playfieldHeight, gapSize, randomSource = Math.random) {
    this.x = x;
    this.width = 60;
    this.gapSize = gapSize;
    this.playfieldHeight = playfieldHeight;
    this.passed = false;

    const minHeight = 60;
    const maxHeight = Math.max(minHeight, playfieldHeight - gapSize - minHeight);
    this.topHeight = randomIntInRange(randomSource, minHeight, maxHeight);
  }

  update(speed, delta, bird, onCollision, onPass) {
    this.x -= speed * delta;

    const bounds = bird.getBounds();
    const withinX = bounds.left < this.x + this.width && bounds.right > this.x;
    const hitsTop = bounds.top < this.topHeight;
    const hitsBottom = bounds.bottom > this.topHeight + this.gapSize;

    if (withinX && (hitsTop || hitsBottom)) {
      onCollision();
    }

    if (!this.passed && bounds.left > this.x + this.width) {
      this.passed = true;
      onPass();
    }
  }

  draw() {
    // Rendering handled by the Three.js renderer.
  }

  isOffScreen() {
    return this.x + this.width < -200;
  }
}
