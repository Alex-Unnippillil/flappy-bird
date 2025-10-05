// File Overview: This module belongs to src/screens/gameplay.ts.
/**
 * Display "Get Ready" & "Instruction"
 * Let the bird swing while waiting...
 * No Pipes
 * Wait for the tap event
 * */

import BannerInstruction from '../model/banner-instruction';
import BirdModel from '../model/bird';
import CounterModel from '../model/count';
import FlashScreen from '../model/flash-screen';
import { IScreenChangerObject } from '../lib/screen-changer';
import MainGameController from '../game';
import ParentClass from '../abstracts/parent-class';
import PipeGenerator from '../model/pipe-generator';
import ScoreBoard from '../model/score-board';
import Sfx from '../model/sfx';
import { beginRun, buildShareUrl } from '../lib/challenge';

export type IGameState = 'died' | 'playing' | 'none';
export default class GetReady extends ParentClass implements IScreenChangerObject {
  private bird: BirdModel;
  private pipeGenerator: PipeGenerator;
  private state: string;
  private gameState: IGameState;
  private count: CounterModel;
  private game: MainGameController;
  private bannerInstruction: BannerInstruction;
  private scoreBoard: ScoreBoard;
  private transition: FlashScreen;
  private hideBird: boolean;
  private flashScreen: FlashScreen;
  private showScoreBoard: boolean;
  private shareUrl: string | null;

  constructor(game: MainGameController) {
    super();
    this.state = 'waiting';
    this.bird = new BirdModel();
    this.count = new CounterModel();
    this.game = game;
    this.pipeGenerator = this.game.pipeGenerator;
    this.bannerInstruction = new BannerInstruction();
    this.gameState = 'none';
    this.scoreBoard = new ScoreBoard();
    this.transition = new FlashScreen({
      interval: 500,
      strong: 1.0,
      style: 'black',
      easing: 'sineWaveHS'
    });
    this.flashScreen = new FlashScreen({
      style: 'white',
      interval: 180,
      strong: 0.7,
      easing: 'linear'
    });
    this.hideBird = false;
    this.showScoreBoard = false;
    this.shareUrl = null;

    this.transition.setEvent([0.99, 1], this.reset.bind(this));
  }

  public init(): void {
    this.bird.init();
    this.count.init();
    this.bannerInstruction.init();
    this.scoreBoard.init();
    this.setButtonEvent();
    this.flashScreen.init();
    this.transition.init();
  }

  public reset(): void {
    beginRun();
    this.gameState = 'none';
    this.state = 'waiting';
    this.game.background.reset();
    this.game.platform.reset();
    this.pipeGenerator.reset();
    this.bannerInstruction.reset();
    this.game.bgPause = false;
    this.hideBird = false;
    this.showScoreBoard = false;
    this.scoreBoard.hide();
    this.bird.reset();
    this.shareUrl = null;
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.bird.resize(this.canvasSize);
    this.count.resize(this.canvasSize);
    this.bannerInstruction.resize(this.canvasSize);
    this.scoreBoard.resize(this.canvasSize);
    this.flashScreen.resize(this.canvasSize);
    this.transition.resize(this.canvasSize);
  }

  public Update(): void {
    this.flashScreen.Update();
    this.transition.Update();
    this.scoreBoard.Update();

    if (!this.bird.alive) {
      this.game.bgPause = true;
      this.bird.Update();
      return;
    }

    if (this.state === 'waiting') {
      this.bird.doWave(
        {
          x: this.bird.coordinate.x,
          y: this.canvasSize.height * 0.48
        },
        1,
        6
      );
      return;
    }

    this.bannerInstruction.Update();
    this.pipeGenerator.Update();
    this.bird.Update();

    if (this.bird.isDead(this.pipeGenerator.pipes)) {
      this.flashScreen.reset();
      this.flashScreen.start();

      this.gameState = 'died';

      window.setTimeout(() => {
        this.scoreBoard.setScore(this.bird.score);
        this.shareUrl = buildShareUrl(this.bird.score);
        this.showScoreBoard = true;
        window.setTimeout(() => {
          this.scoreBoard.showBoard();
          Sfx.swoosh();
        }, 700);
        this.scoreBoard.showBanner();
        Sfx.swoosh();
      }, 500);

      Sfx.hit(() => {
        this.bird.playDead();
      });
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (this.state === 'playing' || this.state === 'waiting') {
      this.bannerInstruction.Display(context);

      if (this.gameState !== 'died' || !this.showScoreBoard) {
        this.count.setNum(this.bird.score);
        this.count.Display(context);
      }

      if (!this.hideBird) this.bird.Display(context);

      this.scoreBoard.Display(context);
    }

    this.flashScreen.Display(context);
    this.transition.Display(context);
  }

  private setButtonEvent(): void {
    this.scoreBoard.onRestart(() => {
      if (this.transition.status.running) return;
      this.transition.reset();
      this.transition.start();
    });

    this.scoreBoard.onShare(() => {
      if (!this.shareUrl) {
        this.shareUrl = buildShareUrl(this.bird.score);
      }

      void this.shareResult();
    });

    // this.scoreBoard.onShowRanks(() => {
    //   console.log("ranking button")
    // })
  }

  public click({ x, y }: ICoordinate): void {
    if (this.gameState === 'died') return;

    this.state = 'playing';
    this.gameState = 'playing';
    this.bannerInstruction.tap();
    this.bird.flap();
  }

  public mouseDown({ x, y }: ICoordinate): void {
    if (this.gameState !== 'died') return;

    this.scoreBoard.mouseDown({ x, y });
  }

  public mouseUp({ x, y }: ICoordinate): void {
    if (this.gameState !== 'died') return;

    this.scoreBoard.mouseUp({ x, y });
  }
  public startAtKeyBoardEvent(): void {
    if (this.gameState === 'died') this.scoreBoard.triggerPlayATKeyboardEvent();
  }

  private async shareResult(): Promise<void> {
    if (!this.shareUrl) return;

    const url = this.shareUrl;

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Flappy Bird Challenge',
          text: `I scored ${this.bird.score}. Can you beat it?`,
          url
        });
        return;
      } catch (error: unknown) {
        const domError = error as DOMException | undefined;
        if (domError?.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      const copied = await this.copyToClipboard(url);
      if (copied) {
        window.alert('Link copied to clipboard!');
      } else {
        throw new Error('Copy failed');
      }
    } catch {
      window.alert(`Unable to copy link automatically. Here it is:\n${url}`);
    }
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback to manual method below
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let success = false;

    try {
      success = document.execCommand('copy');
    } catch {
      success = false;
    } finally {
      document.body.removeChild(textarea);
    }

    return success;
  }
}
