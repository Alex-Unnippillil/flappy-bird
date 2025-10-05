// File Overview: This module belongs to src/model/score-board.ts.
import { rescaleDim } from '../utils';

import medalBronzeSprite from '../assets/medal-bronze.svg';
import medalSilverSprite from '../assets/medal-silver.svg';
import medalGoldSprite from '../assets/medal-gold.svg';
import medalPlatinumSprite from '../assets/medal-platinum.svg';

import ParentObject from '../abstracts/parent-class';
import SparkModel from './spark';
import PlayButton from './btn-play';
import RankingButton from './btn-ranking';
import ToggleSpeaker from './btn-toggle-speaker';
import SpriteDestructor from '../lib/sprite-destructor';
import { Fly, BounceIn, TimingEvent } from '../lib/animation';
import Storage from '../lib/storage';

export default class ScoreBoard extends ParentObject {
  private static readonly FLAG_SHOW_BANNER = 0b0001;
  private static readonly FLAG_SHOW_SCOREBOARD = 0b0010;
  private static readonly FLAG_SHOW_BUTTONS = 0b0100;
  private static readonly FLAG_NEW_HIGH_SCORE = 0b1000;

  private flags: number;

  private images: Map<string, HTMLImageElement>;
  private playButton: PlayButton;
  private rankingButton: RankingButton;
  private toggleSpeakerButton: ToggleSpeaker;
  private FlyInAnim: Fly;
  private BounceInAnim: BounceIn;
  private currentScore: number;
  private currentGeneratedNumber: number;
  private currentHighScore: number;
  private TimingEventAnim: TimingEvent;
  private spark: SparkModel;
  private readonly medalTiers: {
    threshold: number;
    label: string;
    imageKey: string;
  }[];

  constructor() {
    super();
    this.flags = 0;
    this.images = new Map<string, HTMLImageElement>();
    this.playButton = new PlayButton();
    this.rankingButton = new RankingButton();
    this.toggleSpeakerButton = new ToggleSpeaker();
    this.spark = new SparkModel();
    this.currentHighScore = 0;
    this.currentGeneratedNumber = 0;
    this.currentScore = 0;
    this.medalTiers = [
      { threshold: 10, label: 'Platinum', imageKey: 'medal-platinum' },
      { threshold: 5, label: 'Gold', imageKey: 'medal-gold' },
      { threshold: 1, label: 'Silver', imageKey: 'medal-silver' },
      { threshold: 0, label: 'Bronze', imageKey: 'medal-bronze' }
    ];
    this.FlyInAnim = new Fly({
      duration: 500,
      from: {
        x: 0.5,
        y: 1.5
      },
      to: {
        x: 0.5,
        y: 0.438
      },
      transition: 'easeOutExpo'
    });
    this.TimingEventAnim = new TimingEvent({ diff: 30 });
    this.BounceInAnim = new BounceIn({
      durations: {
        bounce: 300,
        fading: 100
      }
    });
  }

  public init(): void {
    this.images.set('banner-gameover', SpriteDestructor.asset('banner-game-over'));
    this.images.set('score-board', SpriteDestructor.asset('score-board'));
    this.images.set('new-icon', SpriteDestructor.asset('toast-new'));
    this.preloadImage('medal-bronze', medalBronzeSprite);
    this.preloadImage('medal-silver', medalSilverSprite);
    this.preloadImage('medal-gold', medalGoldSprite);
    this.preloadImage('medal-platinum', medalPlatinumSprite);

    for (let i = 0; i < 10; ++i) {
      this.images.set(`number-${i}`, SpriteDestructor.asset(`number-md-${i}`));
    }

    this.rankingButton.init();
    this.playButton.init();
    this.toggleSpeakerButton.init();

    this.playButton.active = false;
    this.rankingButton.active = false;
    this.toggleSpeakerButton.active = false;
    this.spark.init();

    /**
     * We need to make sure about this
     * else may throw any error during
     * image retrieval
     * */
    const prevScore = Storage.get('highscore') as number;
    this.currentHighScore = typeof prevScore === 'number' ? prevScore : 0;
  }

  private preloadImage(key: string, src: string): void {
    const img = new Image();
    img.src = src;
    if (typeof img.decode === 'function') {
      void img.decode().catch(() => undefined);
    }

    this.images.set(key, img);
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.rankingButton.resize(this.canvasSize);
    this.playButton.resize(this.canvasSize);
    this.spark.resize(this.canvasSize);
    this.toggleSpeakerButton.resize(this.canvasSize);
  }

  public Update(): void {
    this.rankingButton.Update();
    this.playButton.Update();
    this.spark.Update();
    this.toggleSpeakerButton.Update();
  }

  public Display(context: CanvasRenderingContext2D): void {
    if ((this.flags & ScoreBoard.FLAG_SHOW_BANNER) !== 0) {
      const bgoScaled = rescaleDim(
        {
          width: this.images.get('banner-gameover')!.width,
          height: this.images.get('banner-gameover')!.height
        },
        { width: this.canvasSize.width * 0.7 }
      );
      const anim = this.BounceInAnim.value;
      const yPos = this.canvasSize.height * 0.225 - bgoScaled.height / 2;

      context.globalAlpha = anim.opacity;
      context.drawImage(
        this.images.get('banner-gameover')!,
        this.canvasSize.width * 0.5 - bgoScaled.width / 2,
        yPos + anim.value * (this.canvasSize.height * 0.015),
        bgoScaled.width,
        bgoScaled.height
      );
      context.globalAlpha = 1;
    }

    if ((this.flags & ScoreBoard.FLAG_SHOW_SCOREBOARD) !== 0) {
      const sbScaled = rescaleDim(
        {
          width: this.images.get('score-board')!.width,
          height: this.images.get('score-board')!.height
        },
        { width: this.canvasSize.width * 0.85 }
      );

      // Need to clone
      const anim = Object.assign({}, this.FlyInAnim.value);
      anim.x = this.canvasSize.width * anim.x - sbScaled.width / 2;
      anim.y = this.canvasSize.height * anim.y - sbScaled.height / 2;

      context.drawImage(
        this.images.get('score-board')!,
        anim.x,
        anim.y,
        sbScaled.width,
        sbScaled.height
      );

      if (this.TimingEventAnim.value && this.currentScore > this.currentGeneratedNumber) {
        this.currentGeneratedNumber++;
      }

      /**
       * Only show the buttons, medal, Update high score if possible
       * and 'new' icon after counting
       * */
      if (this.TimingEventAnim.status.complete && !this.TimingEventAnim.status.running) {
        if (this.currentGeneratedNumber > this.currentHighScore) {
          this.setHighScore(this.currentGeneratedNumber);
          this.flags |= ScoreBoard.FLAG_NEW_HIGH_SCORE;
        }

        this.addMedal(context, anim, sbScaled);
        this.showButtons();
      }

      this.displayScore(context, anim, sbScaled);
      this.displayBestScore(
        context,
        anim,
        sbScaled,
        (this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) !== 0
      );

      if (this.FlyInAnim.status.complete && !this.FlyInAnim.status.running) {
        this.TimingEventAnim.start();

        if (this.currentGeneratedNumber === this.currentScore) {
          this.TimingEventAnim.stop();
        }
      }
    }

    if ((this.flags & ScoreBoard.FLAG_SHOW_BUTTONS) !== 0) {
      this.rankingButton.Display(context);
      this.playButton.Display(context);
      this.toggleSpeakerButton.Display(context);
    }
  }

  public showBanner(): void {
    this.flags |= ScoreBoard.FLAG_SHOW_BANNER;
    this.BounceInAnim.start();
  }

  public showBoard(): void {
    this.flags |= ScoreBoard.FLAG_SHOW_SCOREBOARD;
    this.FlyInAnim.start();
    if (this.getMedalTier(this.currentScore)) {
      this.spark.doSpark();
    } else {
      this.spark.stop();
    }
  }

  public showButtons(): void {
    this.flags |= ScoreBoard.FLAG_SHOW_BUTTONS;
    this.playButton.active = true;
    this.rankingButton.active = true;
    this.toggleSpeakerButton.active = true;
  }

  private setHighScore(num: number): void {
    Storage.save('highscore', num);
    this.currentHighScore = num;
  }

  public setScore(num: number): void {
    this.currentScore = num;
  }

  private addMedal(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    const medalTier = this.getMedalTier(this.currentScore);

    if (!medalTier) {
      this.spark.stop();
      return;
    }

    const medal = this.images.get(medalTier.imageKey);

    if (!medal || medal.width === 0 || medal.height === 0) return;

    const scaled = rescaleDim(
      {
        width: medal.width,
        height: medal.height
      },
      { width: parentSize.width * 0.22 }
    );

    const pos = {
      x: coord.x + parentSize.width * 0.145,
      y: coord.y + parentSize.height * 0.46
    };

    context.drawImage(medal, pos.x, pos.y, scaled.width, scaled.height);

    const sparkOrigin = {
      x: pos.x + (scaled.width - scaled.width * 0.7) / 2,
      y: pos.y + (scaled.height - scaled.height * 0.7) / 2
    };

    this.spark.move(sparkOrigin, {
      width: scaled.width * 0.7,
      height: scaled.height * 0.7
    });
    this.spark.Display(context);

    this.drawMedalLabel(
      context,
      medalTier.label,
      pos.x + scaled.width / 2,
      pos.y + scaled.height + parentSize.height * 0.04,
      parentSize
    );
  }

  private getMedalTier(score: number):
    | {
        threshold: number;
        label: string;
        imageKey: string;
      }
    | undefined {
    return this.medalTiers.find((tier) => score >= tier.threshold);
  }

  private drawMedalLabel(
    context: CanvasRenderingContext2D,
    label: string,
    centerX: number,
    topY: number,
    parentSize: IDimension
  ): void {
    const prevFillStyle = context.fillStyle;
    const prevStrokeStyle = context.strokeStyle;
    const prevLineWidth = context.lineWidth;
    const prevFont = context.font;
    const prevAlign = context.textAlign;
    const prevBaseline = context.textBaseline;

    const fontSize = Math.max(parentSize.width * 0.06, 12);
    context.font = `${fontSize}px 'Press Start 2P', 'Roboto', sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.lineWidth = Math.max(parentSize.width * 0.007, 1.5);
    context.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillStyle = '#ffffff';

    const text = label.toUpperCase();
    context.strokeText(text, centerX, topY);
    context.fillText(text, centerX, topY);

    context.fillStyle = prevFillStyle;
    context.strokeStyle = prevStrokeStyle;
    context.lineWidth = prevLineWidth;
    context.font = prevFont;
    context.textAlign = prevAlign;
    context.textBaseline = prevBaseline;
  }

  private displayScore(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    const numSize = rescaleDim(
      {
        width: this.images.get('number-1')!.width,
        height: this.images.get('number-1')!.height
      },
      { width: parentSize.width * 0.05 }
    );

    coord = Object.assign({}, coord);
    coord.x = (coord.x + parentSize.width / 2) * 1.565;
    coord.y = (coord.y + parentSize.height / 2) * 0.864;

    const numArr: string[] = String(this.currentGeneratedNumber).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (numSize.width + 5),
        coord.y,
        numSize.width,
        numSize.height
      );
    });
  }

  private displayBestScore(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension,
    _p0: boolean
  ): void {
    const numSize = rescaleDim(
      {
        width: this.images.get('number-1')!.width,
        height: this.images.get('number-1')!.height
      },
      { width: parentSize.width * 0.05 }
    );

    coord = Object.assign({}, coord);

    coord.x = (coord.x + parentSize.width / 2) * 1.565;
    coord.y = (coord.y + parentSize.height / 2) * 1.074;

    const numArr: string[] = String(this.currentHighScore).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (numSize.width + 5),
        coord.y,
        numSize.width,
        numSize.height
      );
    });

    if ((this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) === 0) return;

    const toastSize = rescaleDim(
      {
        width: this.images.get('new-icon')!.width,
        height: this.images.get('new-icon')!.height
      },
      { width: parentSize.width * 0.14 }
    );

    context.drawImage(
      this.images.get('new-icon')!,
      coord.x * 0.73,
      coord.y * 0.922,
      toastSize.width,
      toastSize.height
    );
  }

  /**
   * Hide all at once
   * */
  public hide(): void {
    this.flags = 0;

    this.playButton.active = false;
    this.rankingButton.active = false;
    this.toggleSpeakerButton.active = false;
    this.currentGeneratedNumber = 0;
    this.FlyInAnim.reset();
    this.BounceInAnim.reset();
    this.TimingEventAnim.reset();
    this.spark.stop();
  }

  public onRestart(cb: IEmptyFunction): void {
    this.playButton.onClick(cb);
  }

  public onShowRanks(_cb: IEmptyFunction): void {
    /**
     * I don't know what to do on ranking?
     *
     * Should i create API for this?
     * */
  }

  public mouseDown({ x, y }: ICoordinate): void {
    this.playButton.mouseEvent('down', { x, y });
    this.rankingButton.mouseEvent('down', { x, y });
    this.toggleSpeakerButton.mouseEvent('down', { x, y });
  }

  public mouseUp({ x, y }: ICoordinate): void {
    this.playButton.mouseEvent('up', { x, y });
    this.rankingButton.mouseEvent('up', { x, y });
    this.toggleSpeakerButton.mouseEvent('up', { x, y });
  }

  public triggerPlayATKeyboardEvent(): void {
    if ((this.flags & ScoreBoard.FLAG_SHOW_BUTTONS) !== 0) this.playButton.click();
  }
}
