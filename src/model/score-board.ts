// File Overview: This module belongs to src/model/score-board.ts.
import { rescaleDim } from '../utils';

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
  private bannerSize: IDimension;
  private scoreBoardSize: IDimension;
  private toastSize: IDimension;
  private digitSizes: Map<string, IDimension>;
  private medalSizes: Map<string, IDimension>;
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

  constructor() {
    super();
    this.flags = 0;
    this.images = new Map<string, HTMLImageElement>();
    this.bannerSize = { width: 0, height: 0 };
    this.scoreBoardSize = { width: 0, height: 0 };
    this.toastSize = { width: 0, height: 0 };
    this.digitSizes = new Map<string, IDimension>();
    this.medalSizes = new Map<string, IDimension>();
    this.playButton = new PlayButton();
    this.rankingButton = new RankingButton();
    this.toggleSpeakerButton = new ToggleSpeaker();
    this.spark = new SparkModel();
    this.currentHighScore = 0;
    this.currentGeneratedNumber = 0;
    this.currentScore = 0;
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
    this.images.set('coin-10', SpriteDestructor.asset('coin-dull-bronze'));
    this.images.set('coin-20', SpriteDestructor.asset('coin-dull-metal'));
    this.images.set('coin-30', SpriteDestructor.asset('coin-shine-gold'));
    this.images.set('coin-40', SpriteDestructor.asset('coin-shine-silver'));
    this.images.set('new-icon', SpriteDestructor.asset('toast-new'));

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

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.rankingButton.resize(this.canvasSize);
    this.playButton.resize(this.canvasSize);
    this.spark.resize(this.canvasSize);
    this.toggleSpeakerButton.resize(this.canvasSize);

    this.rebuildScaledAssets();
  }

  public Update(): void {
    this.rankingButton.Update();
    this.playButton.Update();
    this.spark.Update();
    this.toggleSpeakerButton.Update();
  }

  public Display(context: CanvasRenderingContext2D): void {
    if ((this.flags & ScoreBoard.FLAG_SHOW_BANNER) !== 0) {
      const bgoScaled = this.bannerSize;
      if (bgoScaled.width > 0 && bgoScaled.height > 0) {
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
    }

    if ((this.flags & ScoreBoard.FLAG_SHOW_SCOREBOARD) !== 0) {
      const sbScaled = this.scoreBoardSize;
      if (sbScaled.width <= 0 || sbScaled.height <= 0) return;

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
    this.spark.doSpark();
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
    if (this.currentScore < 10) return; // So sad having a no medal :)
    let medalKey: string | undefined;

    if (this.currentScore >= 10 && this.currentScore < 20) {
      medalKey = 'coin-10';
    } else if (this.currentScore >= 20 && this.currentScore < 30) {
      medalKey = 'coin-20';
    } else {
      if (Math.floor(this.currentScore / 10) % 2 === 0) {
        medalKey = 'coin-40';
      } else {
        medalKey = 'coin-30';
      }
    }

    const medal = medalKey ? this.images.get(medalKey) : undefined;
    const scaled = medalKey ? this.medalSizes.get(medalKey) : undefined;

    if (!medal || !scaled) return;
    const pos = {
      x: (coord.x + parentSize.width / 2) * 0.36,
      y: (coord.y + parentSize.height / 2) * 0.9196
    };

    context.drawImage(medal, pos.x, pos.y, scaled.width, scaled.height);

    this.spark.move(pos, scaled);
    this.spark.Display(context);
  }

  private displayScore(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    const defaultDigit = this.digitSizes.get('0');
    if (!defaultDigit) return;

    coord = Object.assign({}, coord);
    coord.x = (coord.x + parentSize.width / 2) * 1.565;
    coord.y = (coord.y + parentSize.height / 2) * 0.864;

    const numArr: string[] = String(this.currentGeneratedNumber).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      const digitSize = this.digitSizes.get(c) ?? defaultDigit;
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (digitSize.width + 5),
        coord.y,
        digitSize.width,
        digitSize.height
      );
    });
  }

  private displayBestScore(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension,
    _p0: boolean
  ): void {
    const defaultDigit = this.digitSizes.get('0');
    if (!defaultDigit) return;

    coord = Object.assign({}, coord);

    coord.x = (coord.x + parentSize.width / 2) * 1.565;
    coord.y = (coord.y + parentSize.height / 2) * 1.074;

    const numArr: string[] = String(this.currentHighScore).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      const digitSize = this.digitSizes.get(c) ?? defaultDigit;
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (digitSize.width + 5),
        coord.y,
        digitSize.width,
        digitSize.height
      );
    });

    if ((this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) === 0) return;

    const toastSize = this.toastSize;
    if (toastSize.width <= 0 || toastSize.height <= 0) return;

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

  private rebuildScaledAssets(): void {
    if (!this.images.size) {
      this.bannerSize = { width: 0, height: 0 };
      this.scoreBoardSize = { width: 0, height: 0 };
      this.toastSize = { width: 0, height: 0 };
      this.digitSizes.clear();
      this.medalSizes.clear();
      return;
    }

    const canvasWidth = this.canvasSize.width;

    const bannerImage = this.images.get('banner-gameover');
    this.bannerSize = bannerImage
      ? rescaleDim(
          { width: bannerImage.width, height: bannerImage.height },
          { width: canvasWidth * 0.7 }
        )
      : { width: 0, height: 0 };

    const boardImage = this.images.get('score-board');
    this.scoreBoardSize = boardImage
      ? rescaleDim(
          { width: boardImage.width, height: boardImage.height },
          { width: canvasWidth * 0.85 }
        )
      : { width: 0, height: 0 };

    const digitTargetWidth = this.scoreBoardSize.width * 0.05;
    this.digitSizes.clear();
    for (let i = 0; i < 10; ++i) {
      const key = `number-${i}`;
      const digitImage = this.images.get(key);
      if (!digitImage) continue;

      this.digitSizes.set(
        String(i),
        rescaleDim(
          { width: digitImage.width, height: digitImage.height },
          { width: digitTargetWidth }
        )
      );
    }

    const medalTargetWidth = this.scoreBoardSize.width * 0.1878;
    this.medalSizes.clear();
    ['coin-10', 'coin-20', 'coin-30', 'coin-40'].forEach((key) => {
      const medalImage = this.images.get(key);
      if (!medalImage) return;

      this.medalSizes.set(
        key,
        rescaleDim(
          { width: medalImage.width, height: medalImage.height },
          { width: medalTargetWidth }
        )
      );
    });

    const toastImage = this.images.get('new-icon');
    this.toastSize = toastImage
      ? rescaleDim(
          { width: toastImage.width, height: toastImage.height },
          { width: this.scoreBoardSize.width * 0.14 }
        )
      : { width: 0, height: 0 };
  }
}
