// File Overview: This module belongs to src/model/btn-pause.ts.
import Parent from '../abstracts/button-event-handler';
import SpriteDestructor from '../lib/sprite-destructor';

export default class PauseButton extends Parent {
  private toggleCallback?: () => boolean;

  constructor() {
    super();
    this.initialWidth = 0.12;
    this.coordinate.x = 0.88;
    this.coordinate.y = 0.08;
    this.active = true;
  }

  public init(): void {
    this.img = SpriteDestructor.asset('btn-pause');
  }

  public registerToggle(callback: () => boolean): void {
    this.toggleCallback = callback;
  }

  public click(): void {
    this.toggleCallback?.();
  }

  public Update(): void {
    this.reset();

    if (this.isHovered) {
      this.move({ x: 0, y: 0.004 });
    }

    super.Update();
  }

  public Display(ctx: CanvasRenderingContext2D): void {
    if (!this.img) return;

    const xLoc = this.calcCoord.x;
    const yLoc = this.calcCoord.y;
    const xRad = this.dimension.width / 2;
    const yRad = this.dimension.height / 2;

    ctx.drawImage(this.img, xLoc - xRad, yLoc - yRad, xRad * 2, yRad * 2);
  }
}
