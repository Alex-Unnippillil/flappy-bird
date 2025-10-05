// File Overview: This module belongs to src/model/btn-toggle-motion.ts.
import ButtonEventHandler from '../abstracts/button-event-handler';
import MotionPreference, {
  MotionPreferenceMode,
  MotionPreferenceState
} from '../lib/motion-preference';

export default class ToggleMotionButton extends ButtonEventHandler {
  private state: MotionPreferenceState;
  private unsubscribe: (() => void) | null;

  constructor() {
    super();
    this.state = MotionPreference.getState();
    this.unsubscribe = null;
    this.initialWidth = 0;
    this.coordinate.x = 0.78;
    this.coordinate.y = 0.04;
    this.dimension = { width: 0, height: 0 };
    this.active = true;
  }

  public init(): void {
    this.unsubscribe = MotionPreference.subscribe((state) => {
      this.state = state;
    });
  }

  public resetState(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.dimension = {
      width: width * 0.2,
      height: height * 0.065
    };
  }

  public Update(): void {
    super.Update();
    this.reset();

    if (this.isHovered) {
      this.move({ x: 0, y: 0.004 });
    }
  }

  public click(): void {
    MotionPreference.toggle();
  }

  public Display(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.dimension;
    const x = this.calcCoord.x - width / 2;
    const y = this.calcCoord.y - height / 2;

    ctx.save();
    ctx.globalAlpha = this.active ? 1 : 0.5;
    ctx.fillStyle = '#1d2b35';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    if (this.isHovered) {
      ctx.fillStyle = '#243744';
    }

    ctx.beginPath();
    const radius = Math.min(width, height) * 0.22;
    ToggleMotionButton.roundRect(ctx, x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(10, Math.round(height * 0.38))}px 'Press Start 2P', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const primaryLabel = 'Shake';
    const secondaryLabel = ToggleMotionButton.getLabel(this.state.mode, this.state.reduceMotion);

    ctx.fillText(primaryLabel, x + width / 2, y + height * 0.38);

    ctx.font = `${Math.max(8, Math.round(height * 0.32))}px 'Press Start 2P', sans-serif`;
    ctx.fillText(secondaryLabel, x + width / 2, y + height * 0.72);

    ctx.restore();
  }

  private static getLabel(mode: MotionPreferenceMode, reduceMotion: boolean): string {
    if (mode === 'auto') {
      return reduceMotion ? 'Auto Off' : 'Auto On';
    }

    return reduceMotion ? 'Off' : 'On';
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
