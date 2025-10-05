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
import { detectChallengeFromUrl, getChallengeTargetScore } from '../lib/challenge';

export default class Introduction extends ParentClass implements IScreenChangerObject {
  public playButton: PlayButton;
  public rankingButton: RankingButton;
  public toggleSpeakerButton: ToggleSpeaker;

  private bird: BirdModel;
  private flappyBirdBanner: HTMLImageElement | undefined;
  private challengeActive: boolean;
  private challengeTargetScore: number | undefined;

  constructor() {
    super();
    this.bird = new BirdModel();
    this.playButton = new PlayButton();
    this.rankingButton = new RankingButton();
    this.toggleSpeakerButton = new ToggleSpeaker();
    this.flappyBirdBanner = void 0;
    this.challengeActive = false;
    this.challengeTargetScore = void 0;

    const challenge = detectChallengeFromUrl();
    if (challenge) {
      this.challengeActive = true;
      this.challengeTargetScore = challenge.targetScore ?? getChallengeTargetScore();
    }
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

    if (this.challengeActive) {
      this.displayChallengeBanner(context);
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

  private displayChallengeBanner(context: CanvasRenderingContext2D): void {
    const prevAlign = context.textAlign;
    const prevFont = context.font;
    const prevFillStyle = context.fillStyle;

    const containerWidth = this.canvasSize.width * 0.82;
    const containerHeight = this.canvasSize.height * 0.12;
    const containerX = (this.canvasSize.width - containerWidth) / 2;
    const containerY = this.canvasSize.height * 0.8;

    context.fillStyle = 'rgba(0, 0, 0, 0.65)';
    context.fillRect(containerX, containerY, containerWidth, containerHeight);

    context.textAlign = 'center';
    const titleFontSize = Math.max(16, Math.floor(this.canvasSize.height * 0.045));
    context.font = `bold ${titleFontSize}px 'Press Start 2P', sans-serif`;
    context.fillStyle = '#ffffff';
    context.fillText('Challenge Ready!', this.canvasSize.width * 0.5, containerY + containerHeight * 0.45);

    const targetFontSize = Math.max(12, Math.floor(this.canvasSize.height * 0.032));
    context.font = `${targetFontSize}px 'Press Start 2P', sans-serif`;

    const message =
      this.challengeTargetScore !== undefined
        ? `Target Score: ${this.challengeTargetScore}`
        : 'Seed locked for this run';

    context.fillText(message, this.canvasSize.width * 0.5, containerY + containerHeight * 0.82);

    context.textAlign = prevAlign;
    context.font = prevFont;
    context.fillStyle = prevFillStyle;
  }
}
