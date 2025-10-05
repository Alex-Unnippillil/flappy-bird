// File Overview: This module belongs to src/screens/intro.ts.
/**
 * Display "FlappyBird"
 * Display the bird close to the middle and at the center
 *
 * Display "Play" button and include the
 * "Ranking" button but with no function. Just to mimic the
 * original game since ranking only works if the game is
 * connected to Google Play Games or Apple Game Center
 * */

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

  constructor() {
    super();
    this.bird = new BirdModel();
    this.playButton = new PlayButton();
    this.rankingButton = new RankingButton();
    this.toggleSpeakerButton = new ToggleSpeaker();
    this.flappyBirdBanner = void 0;
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

  public Update(delta: number): void {
    this.bird.doWave(
      {
        x: this.canvasSize.width * 0.5,
        y: this.canvasSize.height * 0.46
      },
      1.4,
      9,
      delta
    );

    this.playButton.Update(delta);
    this.rankingButton.Update(delta);
    this.toggleSpeakerButton.Update(delta);
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
}
