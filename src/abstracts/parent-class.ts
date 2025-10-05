// File Overview: This module belongs to src/abstracts/parent-class.ts.
export default abstract class ParentObject {
  protected canvasSize: IDimension;
  public velocity: IVelocity;
  public coordinate: ICoordinate;

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

  public abstract init(): void;
  public abstract Update(delta: number): void;
  public abstract Display(context: CanvasRenderingContext2D): void;
}
