/**
 * Base model for drawable game objects that share canvas-relative state.
 *
 * The class maintains normalized coordinates, velocity, and the current canvas
 * dimensions so subclasses can scale their rendering without duplicating
 * bookkeeping. {@link resize} must be called whenever the canvas changes size
 * to keep derived positions accurate.
 *
 * Extenders are responsible for initializing sprite-specific state inside
 * {@link init}, updating coordinates/velocity coherently in {@link Update}, and
 * rendering within {@link Display} while honoring the shared coordinate system.
 */
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
  public abstract Update(): void;
  public abstract Display(context: CanvasRenderingContext2D): void;
}
