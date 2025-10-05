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
import HighContrastManager from '../lib/high-contrast-manager';

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

      const highContrast = HighContrastManager.isEnabled();

      if (highContrast) {
        this.drawHighContrastPanel(context, anim, sbScaled);
      } else {
        context.drawImage(
          this.images.get('score-board')!,
          anim.x,
          anim.y,
          sbScaled.width,
          sbScaled.height
        );
      }

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

        if (highContrast) this.addHighContrastMedal(context, anim, sbScaled);
        else this.addMedal(context, anim, sbScaled);
        this.showButtons();
      }

      if (highContrast) {
        this.displayHighContrastScores(context, anim, sbScaled);
      } else {
        this.displayScore(context, anim, sbScaled);
        this.displayBestScore(
          context,
          anim,
          sbScaled,
          (this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) !== 0
        );
      }

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
    let medal: HTMLImageElement | undefined;

    if (this.currentScore >= 10 && this.currentScore < 20) {
      medal = this.images.get('coin-10');
    } else if (this.currentScore >= 20 && this.currentScore < 30) {
      medal = this.images.get('coin-20');
    } else {
      if (Math.floor(this.currentScore / 10) % 2 === 0) {
        medal = this.images.get('coin-40');
      } else {
        medal = this.images.get('coin-30');
      }
    }

    const scaled = rescaleDim(
      {
        width: medal!.width,
        height: medal!.height
      },
      { width: parentSize.width * 0.1878 }
    );
    const pos = {
      x: (coord.x + parentSize.width / 2) * 0.36,
      y: (coord.y + parentSize.height / 2) * 0.9196
    };

    context.drawImage(medal!, pos.x, pos.y, scaled.width, scaled.height);

    this.spark.move(pos, scaled);
    this.spark.Display(context);
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

  private drawHighContrastPanel(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    const palette = HighContrastManager.getPalette();
    const radius = parentSize.width * 0.08;
    const stroke = Math.max(4, parentSize.width * 0.02);

    context.save();
    context.fillStyle = palette.scoreboardBackground;
    context.strokeStyle = palette.scoreboardBorder;
    context.lineWidth = stroke;

    this.roundedRect(context, coord.x, coord.y, parentSize.width, parentSize.height, radius);
    context.fill();
    context.stroke();

    context.fillStyle = palette.scoreboardText;
    context.font = `700 ${Math.max(18, parentSize.height * 0.14)}px 'Arial', 'Sans-Serif'`;
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillText('Results', coord.x + parentSize.width * 0.08, coord.y + parentSize.height * 0.12);
    context.restore();
  }

  private displayHighContrastScores(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    const palette = HighContrastManager.getPalette();
    const labelFont = Math.max(16, parentSize.height * 0.12);
    const numberFont = Math.max(24, parentSize.height * 0.22);
    const strokeWidth = Math.max(2, parentSize.width * 0.01);
    const right = coord.x + parentSize.width * 0.9;

    context.save();
    context.textAlign = 'right';
    context.strokeStyle = palette.scoreboardBorder;
    context.fillStyle = palette.scoreboardText;
    context.lineWidth = strokeWidth;

    context.font = `600 ${labelFont}px 'Arial', 'Sans-Serif'`;
    context.fillText('SCORE', right, coord.y + parentSize.height * 0.3);

    context.font = `700 ${numberFont}px 'Arial', 'Sans-Serif'`;
    const scoreY = coord.y + parentSize.height * 0.44;
    context.strokeText(String(this.currentGeneratedNumber), right, scoreY);
    context.fillText(String(this.currentGeneratedNumber), right, scoreY);

    context.font = `600 ${labelFont}px 'Arial', 'Sans-Serif'`;
    const bestLabelY = coord.y + parentSize.height * 0.62;
    context.fillText('BEST', right, bestLabelY);

    context.font = `700 ${numberFont}px 'Arial', 'Sans-Serif'`;
    const bestValueY = coord.y + parentSize.height * 0.76;
    context.strokeText(String(this.currentHighScore), right, bestValueY);
    context.fillText(String(this.currentHighScore), right, bestValueY);

    if ((this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) !== 0) {
      context.textAlign = 'center';
      context.fillStyle = palette.scoreboardAccent;
      context.font = `700 ${labelFont * 0.95}px 'Arial', 'Sans-Serif'`;
      context.fillText(
        'NEW BEST!',
        coord.x + parentSize.width * 0.55,
        coord.y + parentSize.height * 0.88
      );
    }

    context.restore();
  }

  private addHighContrastMedal(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    if (this.currentScore < 10) return;

    const palette = HighContrastManager.getPalette();
    const medalSize = parentSize.width * 0.22;
    const centerX = coord.x + parentSize.width * 0.28;
    const centerY = coord.y + parentSize.height * 0.64;

    let inner = '#c47135';
    let outer = '#f3a683';

    if (this.currentScore >= 20 && this.currentScore < 30) {
      inner = '#e5ecf6';
      outer = '#8a97ab';
    } else if (this.currentScore >= 30) {
      if (Math.floor(this.currentScore / 10) % 2 === 0) {
        inner = '#a5f0ff';
        outer = '#1fb6ff';
      } else {
        inner = '#ffe28a';
        outer = '#ff8c32';
      }
    }

    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      medalSize * 0.1,
      centerX,
      centerY,
      medalSize * 0.5
    );
    gradient.addColorStop(0, inner);
    gradient.addColorStop(1, outer);

    context.save();
    context.fillStyle = gradient;
    context.strokeStyle = palette.scoreboardBorder;
    context.lineWidth = Math.max(3, parentSize.width * 0.012);
    context.beginPath();
    context.arc(centerX, centerY, medalSize / 2, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();

    this.spark.move(
      { x: centerX - medalSize / 2, y: centerY - medalSize / 2 },
      { width: medalSize, height: medalSize }
    );
    this.spark.Display(context);
  }

  private roundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.min(radius, Math.min(width, height) / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
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
