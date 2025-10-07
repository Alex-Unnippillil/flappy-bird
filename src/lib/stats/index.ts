/**
 * Lightweight FPS and debug text overlay renderer.
 *
 * Role
 * - Tracks frame timestamps to compute frames-per-second metrics for diagnostics.
 * - Draws both background containers and formatted text onto a provided canvas context so game
 *   screens can visualize performance information.
 *
 * Inputs & Outputs
 * - Constructor accepts the target `CanvasRenderingContext2D`.
 * - `text(position, preText, postText)`: configures the label drawn alongside the FPS value.
 * - `container(startingPoint, endPoint)`: sets the dimensions for the overlay background.
 * - `mark()`: records the current frame, updates rolling FPS, and renders the overlay.
 *
 * Implementation Notes
 * - Maintains a sliding window of timestamps rather than averaging to ensure FPS reflects the last
 *   second of frames.
 */
interface ITextProperties {
  position: ICoordinate;
  preText: string;
  postText: string;
}

interface IContainerProperties {
  startingPoint: ICoordinate;
  endPoint: ICoordinate;
}

export default class Stats {
  private fps: number;
  private timeArray: number[];
  private context: CanvasRenderingContext2D;
  private containerOpacity: number;
  private textProps: ITextProperties;
  private containerProps: IContainerProperties;
  private lastTimestamp: number | null;
  private redrawAccumulator: number;
  private readonly redrawInterval: number;
  private fpsSamples: number[];
  private readonly maxSamples: number;

  constructor(context: CanvasRenderingContext2D) {
    this.fps = 0;
    this.timeArray = [];
    this.context = context;
    this.containerOpacity = 0.4;
    this.textProps = {
      position: { x: 0, y: 0 },
      preText: '',
      postText: ''
    };
    this.containerProps = {
      startingPoint: {
        x: 0,
        y: 0
      },
      endPoint: {
        x: 0,
        y: 0
      }
    };
    this.lastTimestamp = null;
    this.redrawAccumulator = 0;
    this.redrawInterval = 500;
    this.fpsSamples = [];
    this.maxSamples = 8;
  }

  public text(pos: ICoordinate, preText: string, postText: string): void {
    this.textProps.position = pos;
    this.textProps.preText = preText;
    this.textProps.postText = postText;
  }

  public container(aPoint: ICoordinate, bPoint: ICoordinate): void {
    this.containerProps = {
      startingPoint: aPoint,
      endPoint: bPoint
    };
  }

  public mark(): void {
    const now = performance.now();

    while (this.timeArray.length > 0 && this.timeArray[0] <= now - 1000) {
      this.timeArray.shift();
    }

    this.timeArray.push(now);
    if (this.lastTimestamp !== null) {
      this.redrawAccumulator += now - this.lastTimestamp;
    }
    this.lastTimestamp = now;

    this.updateFps();

    if (this.redrawAccumulator < this.redrawInterval) {
      return;
    }

    this.redrawAccumulator %= this.redrawInterval;
    this.drawStats();
  }

  public forceImmediateUpdate(): void {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = performance.now();
    }

    this.redrawAccumulator = 0;
    this.drawStats();
  }

  private updateFps(): void {
    const sampleCount = this.timeArray.length;
    if (sampleCount === 0) {
      this.fps = 0;
      return;
    }

    let instantFps = sampleCount;

    if (sampleCount >= 2) {
      const elapsed = this.timeArray[sampleCount - 1] - this.timeArray[0];

      if (elapsed > 0) {
        instantFps = ((sampleCount - 1) / elapsed) * 1000;
      }
    }

    this.fpsSamples.push(instantFps);

    if (this.fpsSamples.length > this.maxSamples) {
      this.fpsSamples.shift();
    }

    const total = this.fpsSamples.reduce((acc, value) => acc + value, 0);
    this.fps = total / this.fpsSamples.length;
  }

  private drawStats(): void {
    this.drawContainer();
    const displayValue = Number.isFinite(this.fps) ? Math.round(this.fps) : 0;
    this.drawText(String(displayValue));
  }

  private drawContainer(): void {
    const ctx = this.context;
    const { startingPoint, endPoint } = this.containerProps;

    ctx.beginPath();
    ctx.globalAlpha = this.containerOpacity;
    ctx.fillStyle = '#1e1e20';
    ctx.fillRect(startingPoint.x, startingPoint.y, endPoint.x, endPoint.y);
    ctx.fill();
    ctx.closePath();
  }

  private drawText(text: string) {
    const ctx = this.context;
    const { preText, postText, position } = this.textProps;
    const out = `${preText}${text}${postText}`;

    ctx.beginPath();
    ctx.globalAlpha = 1; // Required
    ctx.font = '30px monospace';
    ctx.fillStyle = '#58d130';
    ctx.textAlign = 'left';
    ctx.fillText(out, position.x, position.y);
    ctx.closePath();
  }
}
