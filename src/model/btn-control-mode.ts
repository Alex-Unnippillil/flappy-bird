// File Overview: This module belongs to src/model/btn-control-mode.ts.
import ButtonEventHandler from '../abstracts/button-event-handler';
import Sfx from './sfx';
import {
  ControlMode,
  subscribeControlMode,
  toggleControlMode
} from '../lib/settings/control-mode';

export default class ControlModeButton extends ButtonEventHandler {
  private mode: ControlMode;
  private readonly heightRatio: number;
  private unsubscribe: (() => void) | null;

  constructor() {
    super();
    this.initialWidth = 0.28;
    this.heightRatio = 0.085;
    this.mode = 'tap';
    this.unsubscribe = null;
    this.coordinate.x = 0.74;
    this.coordinate.y = 0.04;
    this.active = true;
  }

  public init(): void {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = subscribeControlMode((mode) => {
      this.setMode(mode);
    });
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.dimension = {
      width: width * this.initialWidth,
      height: height * this.heightRatio
    };
  }

  public Update(): void {
    this.reset();

    if (this.isHovered) {
      this.move({
        x: 0,
        y: 0.004
      });
    }

    super.Update();
  }

  public click(): void {
    Sfx.swoosh();
    this.mode = toggleControlMode();
  }

  public Display(ctx: CanvasRenderingContext2D): void {
    const width = this.dimension.width;
    const height = this.dimension.height;
    const x = this.calcCoord.x - width / 2;
    const y = this.calcCoord.y - height / 2;
    const radius = Math.min(width, height) * 0.2;

    ctx.save();

    if (width === 0 || height === 0) {
      ctx.restore();
      return;
    }

    ctx.lineWidth = Math.max(2, height * 0.08);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';

    const baseColor = this.mode === 'hold' ? '#2f6f3f' : '#2e374b';
    const hoverColor = this.mode === 'hold' ? '#38854a' : '#3a445d';
    ctx.fillStyle = this.isHovered ? hoverColor : baseColor;

    this.drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${height * 0.26}px sans-serif`;
    ctx.fillText('Control', this.calcCoord.x, this.calcCoord.y - height * 0.25);

    ctx.font = `bold ${height * 0.42}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      this.mode === 'tap' ? 'Tap' : 'Hold',
      this.calcCoord.x,
      this.calcCoord.y + height * 0.15
    );

    ctx.restore();
  }

  public setAnchor({ x, y }: ICoordinate): void {
    this.coordinate.x = x;
    this.coordinate.y = y;
  }

  private setMode(mode: ControlMode): void {
    this.mode = mode;
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
