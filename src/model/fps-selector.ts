// File Overview: This module belongs to src/model/fps-selector.ts.
import ParentClass from '../abstracts/parent-class';
import { FPS_OPTIONS, IFpsCap } from '../lib/settings';

interface IFpsButton {
  fps: IFpsCap;
  x: number;
  y: number;
  width: number;
  height: number;
}

type IFpsChangeHandler = (fps: IFpsCap) => void;

export default class FpsSelector extends ParentClass {
  private buttons: IFpsButton[];
  private selected: IFpsCap;
  private pressed: IFpsCap | null;
  private onChange: IFpsChangeHandler | undefined;

  constructor() {
    super();
    this.buttons = [];
    this.selected = FPS_OPTIONS[1];
    this.pressed = null;
  }

  public init(): void {
    this.pressed = null;
  }

  public setSelection(fps: IFpsCap): void {
    this.selected = fps;
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    const buttonWidth = width * 0.14;
    const buttonHeight = height * 0.065;
    const spacing = width * 0.018;
    const totalWidth = buttonWidth * FPS_OPTIONS.length + spacing * (FPS_OPTIONS.length - 1);
    const startX = width * 0.5 - totalWidth / 2;
    const y = height * 0.08;

    this.buttons = FPS_OPTIONS.map((fps, index) => ({
      fps,
      x: startX + index * (buttonWidth + spacing),
      y,
      width: buttonWidth,
      height: buttonHeight
    }));
  }

  public Update(): void {
    if (!this.buttons.length) return;

    const hasSelection = this.buttons.some((button) => button.fps === this.selected);

    if (!hasSelection) {
      this.selected = this.buttons[0].fps;
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (this.buttons.length === 0) return;

    context.save();

    // Label
    context.globalAlpha = 1;
    context.fillStyle = '#f5f5f5';
    context.font = `${Math.round(this.canvasSize.height * 0.04)}px monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.fillText('FPS', this.canvasSize.width * 0.5, this.buttons[0].y - this.canvasSize.height * 0.012);

    const textSize = Math.max(Math.round(this.canvasSize.height * 0.035), 12);
    context.font = `${textSize}px monospace`;
    context.textBaseline = 'middle';

    for (const button of this.buttons) {
      const isSelected = button.fps === this.selected;
      const background = isSelected ? '#58d130' : '#1e1e20';
      const border = isSelected ? '#aef167' : '#2c2c34';

      context.globalAlpha = isSelected ? 0.95 : 0.7;
      context.fillStyle = background;
      context.fillRect(button.x, button.y, button.width, button.height);

      context.globalAlpha = 1;
      context.lineWidth = Math.max(this.canvasSize.width * 0.002, 1.5);
      context.strokeStyle = border;
      context.strokeRect(button.x, button.y, button.width, button.height);

      context.fillStyle = '#f5f5f5';
      context.fillText(`${button.fps}`, button.x + button.width / 2, button.y + button.height / 2);
    }

    context.restore();
  }

  public mouseDown(coord: ICoordinate): void {
    const target = this.hitTest(coord);
    this.pressed = target?.fps ?? null;
  }

  public mouseUp(coord: ICoordinate): void {
    const target = this.hitTest(coord);

    if (target && this.pressed === target.fps) {
      if (this.selected !== target.fps) {
        this.selected = target.fps;
        this.onChange?.(target.fps);
      }
    }

    this.pressed = null;
  }

  public onSelectionChange(callback: IFpsChangeHandler): void {
    this.onChange = callback;
  }

  private hitTest({ x, y }: ICoordinate): IFpsButton | undefined {
    return this.buttons.find(
      (button) =>
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
    );
  }
}
