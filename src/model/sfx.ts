/**
 * Model Summary:
 * Purpose: Provides a centralized audio facade for game sound effects with shared volume control.
 * Update/Display: Non-visual model; exposes synchronous methods that trigger WebSfx playback.
 * Public API: init(), volume(num), die(), point(), hit(cb), swoosh(), wing().
 * Constants: None.
 * Interactions: Wraps WebSfx and is invoked by Bird, button models, and other gameplay systems to produce sound.
 */
import WebSfx from '../lib/web-sfx';
import sfDie from '../assets/audio/die.ogg';
import sfHit from '../assets/audio/hit.ogg';
import sfPoint from '../assets/audio/point.ogg';
import sfSwoosh from '../assets/audio/swooshing.ogg';
import sfWing from '../assets/audio/wing.ogg';

export default class Sfx {
  public static currentVolume = 1;

  public static async init() {
    await WebSfx.init();
  }

  public static volume(num: number): void {
    Sfx.currentVolume = num;
  }

  public static die(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(sfDie);
  }

  public static point(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(sfPoint);
  }

  public static hit(cb: IEmptyFunction): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(sfHit, cb);
  }

  public static swoosh(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(sfSwoosh);
  }

  public static wing(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(sfWing);
  }
}
