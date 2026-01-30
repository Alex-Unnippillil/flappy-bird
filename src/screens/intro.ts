// File Overview: This module belongs to src/screens/intro.ts.
/**
 * Intro screen responsible for bootstrapping the main menu experience that
 * precedes gameplay. ScreenChanger mounts this class to present the brand
 * banner, looping bird animation, and the primary interaction controls that
 * trigger a transition into the gameplay screen.
 *
 * UI initialization wires up BirdModel plus the Play, Ranking, and Speaker
 * toggle buttons so ParentClass lifecycle callbacks (init/resize/Update/
 * Display) keep them synchronized with the current canvas dimensions. All
 * models are created eagerly and cached to ensure ScreenChanger can swap back
 * without reallocating assets.
 *
 * Event hooks funnel mouse/touch activity to each button model and surface the
 * "start" affordance through both mouseUp and keyboard entry (startAtKeyboard
 * simply clicks the Play button). UX nuances include always activating the
 * audio toggle regardless of play state, updating the bird idle animation via
 * doWave to keep the scene lively, and drawing the scaled title banner after
 * controls so it never overlaps touch targets.
 */

import { rescaleDim } from '../utils';

import BirdModel from '../model/bird';
import { IScreenChangerObject } from '../lib/screen-changer';
import ParentClass from '../abstracts/parent-class';
import PlayButton from '../model/btn-play';
import RankingButton from '../model/btn-ranking';
import ToggleSpeaker from '../model/btn-toggle-speaker';
import SpriteDestructor from '../lib/sprite-destructor';

export default class Introduction extends ParentClass implements IScreenChangerObject {
  public playButton: PlayButton;
  public rankingButton: RankingButton;
  public toggleSpeakerButton: ToggleSpeaker;

  private bird: BirdModel;
  private flappyBirdBanner: HTMLImageElement | undefined;
  private gamepadHintText: string | null;
  private showGamepadHint: boolean;
  private gamepadHintAlpha: number;

  constructor() {
    super();
    this.bird = new BirdModel();
    this.playButton = new PlayButton();
    this.rankingButton = new RankingButton();
    this.toggleSpeakerButton = new ToggleSpeaker();
    this.flappyBirdBanner = void 0;
    this.gamepadHintText = null;
    this.showGamepadHint = false;
    this.gamepadHintAlpha = 0;
  }

  public init(): void {
    this.bird.init();
    this.playButton.init();
    this.rankingButton.init();
    this.toggleSpeakerButton.init();
    this.flappyBirdBanner = SpriteDestructor.asset('banner-flappybird');
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });
    this.bird.resize({ width, height });
    this.playButton.resize({ width, height });
    this.rankingButton.resize({ width, height });
    this.toggleSpeakerButton.resize({ width, height });
  }

  public Update(): void {
    this.bird.doWave(
      {
        x: this.canvasSize.width * 0.5,
        y: this.canvasSize.height * 0.46
      },
      1.4,
      9
    );

    this.playButton.Update();
    this.rankingButton.Update();
    this.toggleSpeakerButton.Update();

    const targetAlpha = this.showGamepadHint ? 1 : 0;
    this.gamepadHintAlpha += (targetAlpha - this.gamepadHintAlpha) * 0.18;

    if (Math.abs(targetAlpha - this.gamepadHintAlpha) < 0.01) {
      this.gamepadHintAlpha = targetAlpha;
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    this.toggleSpeakerButton.Display(context);
    this.playButton.Display(context);
    this.rankingButton.Display(context);
    this.bird.Display(context);

    // Flappy Bird Banner
    const fbbScaled = rescaleDim(
      {
        width: this.flappyBirdBanner!.width,
        height: this.flappyBirdBanner!.height
      },
      { width: this.canvasSize.width * 0.67 }
    );

    context.drawImage(
      this.flappyBirdBanner!,
      this.canvasSize.width * 0.5 - fbbScaled.width / 2,
      this.canvasSize.height * 0.36 - fbbScaled.height / 2,
      fbbScaled.width,
      fbbScaled.height
    );
    // ----------------------------------

    if (this.gamepadHintAlpha > 0.01) {
      const bannerWidth = this.canvasSize.width * 0.86;
      const baseFontSize = Math.max(14, this.canvasSize.width * 0.035);
      const secondaryFontSize = Math.max(12, baseFontSize * 0.75);
      const bannerHeight = baseFontSize * 2.6;
      const bannerX = (this.canvasSize.width - bannerWidth) / 2;
      const bannerY = this.canvasSize.height * 0.82;
      const title = this.gamepadHintText ?? 'Controller connected';

      context.save();
      context.globalAlpha = this.gamepadHintAlpha;
      context.fillStyle = 'rgba(0, 0, 0, 0.65)';
      context.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);

      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      context.font = `${baseFontSize}px 'Press Start 2P', sans-serif`;
      context.fillText(title, this.canvasSize.width / 2, bannerY + bannerHeight * 0.38);

      context.font = `${secondaryFontSize}px 'Press Start 2P', sans-serif`;
      context.fillText('Press A / Start to play', this.canvasSize.width / 2, bannerY + bannerHeight * 0.72);
      context.restore();
    }

  }

  public mouseDown({ x, y }: ICoordinate): void {
    this.toggleSpeakerButton.mouseEvent('down', { x, y });
    this.playButton.mouseEvent('down', { x, y });
    this.rankingButton.mouseEvent('down', { x, y });
  }

  public mouseUp({ x, y }: ICoordinate): void {
    this.toggleSpeakerButton.mouseEvent('up', { x, y });
    this.playButton.mouseEvent('up', { x, y });
    this.rankingButton.mouseEvent('up', { x, y });
  }

  public startAtKeyBoardEvent(): void {
    this.playButton.click();
  }

  public setGamepadHint(label?: string): void {
    if (label !== undefined) {
      const sanitized = label.trim();
      this.showGamepadHint = true;
      this.gamepadHintText =
        sanitized.length > 0 ? Introduction.formatGamepadLabel(sanitized) : null;
      return;
    }

    this.showGamepadHint = false;
    this.gamepadHintText = null;
  }

  private static formatGamepadLabel(label: string): string {
    const normalized = label.replace(/\s+/g, ' ').trim();
    if (normalized.length <= 36) return normalized;
    return normalized.slice(0, 35) + '…';
  }
}
