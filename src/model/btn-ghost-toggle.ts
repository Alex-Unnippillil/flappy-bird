// File Overview: This module belongs to src/model/btn-ghost-toggle.ts.
import ButtonEventHandler from '../abstracts/button-event-handler';
import SpriteDestructor from '../lib/sprite-destructor';
import Sfx from './sfx';

type ToggleCallback = (enabled: boolean) => void;

export default class GhostToggleButton extends ButtonEventHandler {
  private enabled: boolean;
  private callback?: ToggleCallback;
  private icon: HTMLCanvasElement;

  constructor() {
    super();
    this.initialWidth = 0.32;
    this.coordinate.x = 0.5;
    this.coordinate.y = 0.868;
    this.enabled = true;
    this.icon = document.createElement('canvas');
    this.active = false;
  }

  public init(): void {
    const base = SpriteDestructor.asset('bird-yellow-mid');
    this.icon = document.createElement('canvas');
    this.icon.width = base.width;
    this.icon.height = base.height;
    const ctx = this.icon.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.icon.width, this.icon.height);
    ctx.globalAlpha = 1;
    ctx.drawImage(base, 0, 0, base.width, base.height);
    ctx.globalCompositeOperation = 'source-atop';
    const gradient = ctx.createLinearGradient(0, 0, 0, this.icon.height);
    gradient.addColorStop(0, '#f1f3f8');
    gradient.addColorStop(0.45, '#c8ccd8');
    gradient.addColorStop(1, '#959bad');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.icon.width, this.icon.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.icon.width, this.icon.height * 0.5);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  public resize(size: IDimension): void {
    this.canvasSize = { ...size };
    const width = size.width * this.initialWidth;
    const height = width * 0.36;
    this.dimension = { width, height };
  }

  public Update(): void {
    this.reset();

    if (this.isHovered) {
      this.move({ x: 0, y: 0.006 });
    }

    super.Update();
  }

  public click(): void {
    Sfx.swoosh();
    this.enabled = !this.enabled;
    this.callback?.(this.enabled);
  }

  public onToggle(callback: ToggleCallback): void {
    this.callback = callback;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public get isEnabled(): boolean {
    return this.enabled;
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.min(radius, Math.min(width, height) / 2);

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

  public Display(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.dimension;
    const x = this.calcCoord.x;
    const y = this.calcCoord.y;

    ctx.save();
    ctx.translate(x, y);

    const radius = height / 2;
    ctx.shadowColor = 'rgba(48, 56, 88, 0.35)';
    ctx.shadowBlur = height * 0.6;
    ctx.shadowOffsetY = height * 0.2;

    GhostToggleButton.roundRect(ctx, -width / 2, -height / 2, width, height, radius);
    const baseGradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);

    if (this.enabled) {
      baseGradient.addColorStop(0, '#909bb5');
      baseGradient.addColorStop(0.55, '#7884a1');
      baseGradient.addColorStop(1, '#636f8b');
    } else {
      baseGradient.addColorStop(0, '#d6d2cc');
      baseGradient.addColorStop(0.55, '#c1bbb5');
      baseGradient.addColorStop(1, '#a8a29c');
    }

    ctx.fillStyle = baseGradient;
    ctx.fill();

    if (this.isHovered) {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#ffffff';
      GhostToggleButton.roundRect(ctx, -width / 2, -height / 2, width, height, radius);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = height * 0.08;
    ctx.strokeStyle = this.enabled
      ? 'rgba(255, 255, 255, 0.38)'
      : 'rgba(255, 255, 255, 0.28)';
    ctx.stroke();

    const sheen = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
    sheen.addColorStop(0, 'rgba(255,255,255,0.6)');
    sheen.addColorStop(0.4, 'rgba(255,255,255,0)');
    sheen.addColorStop(1, 'rgba(255,255,255,0.08)');
    ctx.globalAlpha = 0.85;
    GhostToggleButton.roundRect(
      ctx,
      -width / 2 + height * 0.05,
      -height / 2 + height * 0.05,
      width - height * 0.1,
      height - height * 0.1,
      radius - height * 0.05
    );
    ctx.fillStyle = sheen;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.shadowColor = 'rgba(86, 98, 132, 0.45)';
    ctx.shadowBlur = height * 0.25;
    ctx.shadowOffsetY = height * 0.12;
    const iconScale = height * 0.74;
    const iconAspect = this.icon.height / Math.max(1, this.icon.width);
    const iconWidth = iconScale;
    const iconHeight = iconScale * iconAspect;

    ctx.globalAlpha = this.enabled ? 0.68 : 0.45;
    ctx.drawImage(
      this.icon,
      -width * 0.32 - iconWidth / 2,
      -iconHeight / 2,
      iconWidth,
      iconHeight
    );

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${height * 0.42}px 'Arial Black', 'Arial', sans-serif`;
    ctx.fillText('GHOST', -width * 0.08, -height * 0.18);

    ctx.font = `${height * 0.36}px 'Arial', sans-serif`;
    ctx.fillStyle = this.enabled
      ? 'rgba(237, 244, 255, 0.92)'
      : 'rgba(230, 229, 232, 0.72)';
    ctx.fillText(this.enabled ? 'ON' : 'OFF', -width * 0.08, height * 0.3);

    const indicatorRadius = height * 0.22;
    ctx.beginPath();
    ctx.arc(width * 0.32, 0, indicatorRadius, 0, Math.PI * 2);
    const indicator = ctx.createRadialGradient(
      width * 0.32 - indicatorRadius * 0.2,
      -indicatorRadius * 0.2,
      indicatorRadius * 0.1,
      width * 0.32,
      0,
      indicatorRadius
    );

    if (this.enabled) {
      indicator.addColorStop(0, 'rgba(255,255,255,0.95)');
      indicator.addColorStop(1, 'rgba(182, 214, 255, 0.85)');
    } else {
      indicator.addColorStop(0, 'rgba(255,255,255,0.75)');
      indicator.addColorStop(1, 'rgba(190, 190, 200, 0.65)');
    }

    ctx.fillStyle = indicator;
    ctx.fill();
    ctx.lineWidth = height * 0.06;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();

    ctx.lineWidth = height * 0.08;
    ctx.lineCap = 'round';

    ctx.beginPath();
    if (this.enabled) {
      ctx.strokeStyle = 'rgba(70, 82, 120, 0.65)';
      ctx.moveTo(width * 0.26, 0);
      ctx.lineTo(width * 0.32, indicatorRadius * 0.32);
      ctx.lineTo(width * 0.38, -indicatorRadius * 0.35);
    } else {
      ctx.strokeStyle = 'rgba(90, 90, 100, 0.55)';
      ctx.moveTo(width * 0.27, 0);
      ctx.lineTo(width * 0.37, 0);
    }
    ctx.stroke();

    ctx.restore();
  }
}
