// File Overview: This module belongs to src/model/btn-toggle-speaker.ts.
import Parent from '../abstracts/button-event-handler';
import SpriteDestructor from '../lib/sprite-destructor';
import Sfx from './sfx';
import { settings } from '../lib/settings';

export default class ToggleSpeakerBtn extends Parent {
  private assets: Map<string, HTMLImageElement>;
  private is_mute: boolean;
  private previousVolume: number;

  constructor() {
    super();
    this.initialWidth = 0.1;
    this.assets = new Map();
    this.is_mute = settings.get('volume') <= 0;
    this.previousVolume = settings.get('volume') || 0.6;
    this.coordinate.x = 0.93;
    this.coordinate.y = 0.04;
    this.active = true;
  }

  public click(): void {
    Sfx.swoosh();
    if (this.is_mute) {
      const restored = this.previousVolume > 0 ? this.previousVolume : 0.6;
      settings.set('volume', Math.min(1, restored));
    } else {
      this.previousVolume = settings.get('volume');
      settings.set('volume', 0);
    }
  }

  private setImg(): void {
    const key = `${this.is_mute ? 'mute' : 'unmute'}`;
    this.img = this.assets.get(key)!;
  }

  public init(): void {
    this.assets.set('mute', SpriteDestructor.asset('btn-mute'));
    this.assets.set('unmute', SpriteDestructor.asset('btn-speaker'));

    this.setImg();

    settings.subscribe('volume', (volume) => {
      this.is_mute = volume <= 0;
      if (!this.is_mute) {
        this.previousVolume = volume;
      }
    });
  }

  public Update(): void {
    this.reset();

    if (this.isHovered) {
      this.move({
        x: 0,
        y: 0.004
      });
    }

    this.setImg();

    super.Update();
  }

  public Display(ctx: CanvasRenderingContext2D): void {
    const xLoc = this.calcCoord.x;
    const yLoc = this.calcCoord.y;
    const xRad = this.dimension.width / 2;
    const yRad = this.dimension.height / 2;

    ctx.drawImage(this.img!, xLoc - xRad, yLoc - yRad, xRad * 2, yRad * 2);
  }
}
