export interface GroundSegment {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GroundOptions {
  /** Width of each repeating ground tile. */
  tileWidth?: number;
  /** Height of the ground strip at the bottom of the canvas. */
  height?: number;
  /** Initial horizontal scroll speed applied to the ground tiles. */
  initialScrollSpeed?: number;
}

/**
 * Manages a repeating ground strip that scrolls horizontally to simulate motion.
 */
export class Ground {
  private readonly width: number;

  private readonly height: number;

  private readonly tileWidth: number;

  private readonly y: number;

  private offset: number;

  private scrollSpeed: number;

  constructor(canvasWidth: number, canvasHeight: number, options: GroundOptions = {}) {
    this.width = canvasWidth;
    this.tileWidth = Math.max(16, Math.floor(options.tileWidth ?? 96));
    this.height = Math.max(16, Math.floor(options.height ?? canvasHeight * 0.18));
    this.y = canvasHeight - this.height;
    this.scrollSpeed = Math.max(0, options.initialScrollSpeed ?? 2);
    this.offset = 0;
  }

  /**
   * Advances the scrolling offset. Wrapping the offset keeps tiles seamless.
   */
  update(): void {
    if (this.scrollSpeed <= 0) {
      return;
    }

    this.offset = (this.offset + this.scrollSpeed) % this.tileWidth;
  }

  /**
   * Resets the ground to its starting position and optionally updates speed.
   */
  reset(initialScrollSpeed?: number): void {
    this.offset = 0;
    if (typeof initialScrollSpeed === "number") {
      this.setScrollSpeed(initialScrollSpeed);
    }
  }

  /** Updates the horizontal scrolling speed. */
  setScrollSpeed(speed: number): void {
    this.scrollSpeed = Math.max(0, speed);
  }

  /**
   * Returns the current horizontal scrolling speed. Useful for syncing visuals.
   */
  getScrollSpeed(): number {
    return this.scrollSpeed;
  }

  /**
   * Provides the drawable segments that make up the repeating ground.
   * The returned segments always cover the entire canvas width plus one
   * additional tile to avoid seams at the right edge.
   */
  getSegments(): GroundSegment[] {
    const segments: GroundSegment[] = [];
    let x = -this.offset;

    while (x <= this.width) {
      segments.push({
        x,
        y: this.y,
        width: this.tileWidth,
        height: this.height,
      });
      x += this.tileWidth;
    }

    return segments;
  }

  /** Returns the vertical position of the ground strip. */
  getY(): number {
    return this.y;
  }

  /** Returns the height of the ground strip. */
  getHeight(): number {
    return this.height;
  }
}
