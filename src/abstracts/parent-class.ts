// File Overview: This module belongs to src/abstracts/parent-class.ts.
export default abstract class ParentObject {
  protected canvasSize: IDimension;
  public velocity: IVelocity;
  public coordinate: ICoordinate;
  private static deltaTimeMs = 1000 / 60;
  private static deltaSeconds = ParentObject.deltaTimeMs / 1000;
  private static deltaRatio = 1;

  constructor() {
    this.canvasSize = {
      width: 0,
      height: 0
    };

    this.velocity = {
      x: 0,
      y: 0
    };

    this.coordinate = {
      x: 0,
      y: 0
    };
  }

  public resize({ width, height }: IDimension): void {
    this.canvasSize = { width, height };
  }

  protected static setDelta(delta: number): void {
    const safeDelta = Number.isFinite(delta) ? Math.max(delta, 0) : 0;
    ParentObject.deltaTimeMs = safeDelta;
    ParentObject.deltaSeconds = safeDelta / 1000;
    ParentObject.deltaRatio = safeDelta / (1000 / 60);
  }

  protected get deltaTime(): number {
    return ParentObject.deltaTimeMs;
  }

  protected get deltaSeconds(): number {
    return ParentObject.deltaSeconds;
  }

  protected get deltaRatio(): number {
    return ParentObject.deltaRatio;
  }

  public static updateDelta(delta: number): void {
    ParentObject.setDelta(delta);
  }

  public abstract init(): void;
  public abstract Update(delta?: number): void;
  public abstract Display(context: CanvasRenderingContext2D): void;
}
