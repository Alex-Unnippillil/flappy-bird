// File Overview: This module belongs to src/model/btn-toggle-haptics.ts.
import ButtonEventHandler from '../abstracts/button-event-handler';
import Haptics from '../lib/haptics';

export default class ToggleHapticsBtn extends ButtonEventHandler {
  private isEnabled: boolean;
  private isSupported: boolean;
  private isBlockedByPrefs: boolean;
  private isInteractable: boolean;

  constructor() {
    super();
    this.initialWidth = 0.085;
    this.coordinate.x = 0.85;
    this.coordinate.y = 0.04;
    this.isEnabled = false;
    this.isSupported = false;
    this.isBlockedByPrefs = false;
    this.active = true;
    this.isInteractable = false;
  }

  public init(): void {
    this.syncState();
  }

  public resize(size: IDimension): void {
    super.resize(size);

    const side = size.width * this.initialWidth;
    this.dimension.width = side;
    this.dimension.height = side;
  }

  public Update(): void {
    this.syncState();
    super.Update();
  }

  public click(): void {
    if (!this.active || !this.isInteractable) return;

    Haptics.toggle();
    this.syncState();
  }

  public Display(context: CanvasRenderingContext2D): void {
    const xLoc = this.calcCoord.x;
    const yLoc = this.calcCoord.y;
    const radius = Math.min(this.dimension.width, this.dimension.height) / 2;

    context.save();
    context.translate(xLoc, yLoc);

    const baseOpacity = this.isSupported ? 1 : 0.3;
    context.globalAlpha = baseOpacity;

    const backgroundColor = this.isEnabled ? '#f4c542' : '#d7d7d7';
    context.fillStyle = backgroundColor;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();

    const strokeColor = this.isEnabled ? '#332f2f' : '#6b6b6b';
    context.strokeStyle = strokeColor;
    context.lineWidth = radius * 0.18;
    context.lineCap = 'round';

    context.beginPath();
    context.moveTo(-radius * 0.35, -radius * 0.5);
    context.lineTo(-radius * 0.35, radius * 0.5);
    context.stroke();

    context.beginPath();
    context.arc(0, 0, radius * 0.45, -Math.PI / 3, Math.PI / 3);
    context.stroke();

    context.beginPath();
    context.arc(0, 0, radius * 0.7, -Math.PI / 3, Math.PI / 3);
    context.stroke();

    if (!this.isEnabled) {
      context.strokeStyle = 'rgba(70, 70, 70, 0.85)';
      context.lineWidth = radius * 0.16;
      context.beginPath();
      context.moveTo(-radius * 0.7, -radius * 0.7);
      context.lineTo(radius * 0.7, radius * 0.7);
      context.stroke();
    }

    if (this.isBlockedByPrefs || !this.isInteractable) {
      context.fillStyle = 'rgba(0, 0, 0, 0.35)';
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  private syncState(): void {
    const state = Haptics.state;
    this.isEnabled = state.enabled;
    this.isSupported = state.supported;
    this.isBlockedByPrefs = state.autoDisabled;
    this.isInteractable = this.isSupported && !this.isBlockedByPrefs;
  }
}
