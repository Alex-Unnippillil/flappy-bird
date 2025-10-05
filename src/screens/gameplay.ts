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
import { BIRD_JUMP_HEIGHT } from '../constants';
import {
  ControlMode,
  DEFAULT_CONTROL_MODE,
  getControlMode,
  subscribeControlMode
} from '../lib/settings/control-mode';

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
  private controlMode: ControlMode;
  private controlModeSubscription: (() => void) | null;
  private holdActive: boolean;
  private holdFrames: number;
  private holdImpulseStrength: number;
  private holdContinuousBase: number;
  private holdContinuousBonus: number;
  private holdRampFrames: number;

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
    this.controlMode = DEFAULT_CONTROL_MODE;
    this.controlModeSubscription = null;
    this.holdActive = false;
    this.holdFrames = 0;
    this.holdImpulseStrength = 0;
    this.holdContinuousBase = 0;
    this.holdContinuousBonus = 0;
    this.holdRampFrames = 18;

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

    this.applyControlMode(getControlMode());

    if (!this.controlModeSubscription) {
      this.controlModeSubscription = subscribeControlMode((mode) => {
        this.applyControlMode(mode);
      });
    }
  }

  public reset(): void {
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
    this.clearHoldState();
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.bird.resize(this.canvasSize);
    this.count.resize(this.canvasSize);
    this.bannerInstruction.resize(this.canvasSize);
    this.scoreBoard.resize(this.canvasSize);
    this.flashScreen.resize(this.canvasSize);
    this.transition.resize(this.canvasSize);

    this.computeHoldForces();
  }

  public Update(): void {
    this.flashScreen.Update();
    this.transition.Update();
    this.scoreBoard.Update();

    if (!this.bird.alive) {
      this.game.bgPause = true;
      this.clearHoldState();
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
    this.updateHoldLift();
    this.bird.Update();

    if (this.bird.isDead(this.pipeGenerator.pipes)) {
      this.flashScreen.reset();
      this.flashScreen.start();

      this.gameState = 'died';

      window.setTimeout(() => {
        this.scoreBoard.setScore(this.bird.score);
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

    // this.scoreBoard.onShowRanks(() => {
    //   console.log("ranking button")
    // })
  }

  private applyControlMode(mode: ControlMode): void {
    this.controlMode = mode;

    if (mode !== 'hold') {
      this.clearHoldState();
    }
  }

  private clearHoldState(): void {
    this.holdActive = false;
    this.holdFrames = 0;
  }

  private triggerHoldImpulse(): void {
    if (this.controlMode !== 'hold') return;

    if (this.holdImpulseStrength === 0) {
      this.computeHoldForces();
    }

    this.holdActive = true;
    this.holdFrames = 0;
    this.bird.applyLift(this.holdImpulseStrength);
    Sfx.wing();
  }

  private updateHoldLift(): void {
    if (
      this.controlMode !== 'hold' ||
      !this.holdActive ||
      this.state !== 'playing' ||
      this.gameState !== 'playing' ||
      !this.bird.alive
    ) {
      return;
    }

    const progress = Math.min(1, this.holdFrames / this.holdRampFrames);
    const eased = 1 - Math.pow(1 - progress, 2);
    const lift = this.holdContinuousBase + this.holdContinuousBonus * eased;

    if (lift > 0) {
      this.bird.applyLift(lift);
    }

    if (this.holdFrames < this.holdRampFrames) {
      this.holdFrames++;
    }
  }

  private computeHoldForces(): void {
    if (this.canvasSize.height === 0) return;

    const baseImpulse = this.canvasSize.height * Math.abs(BIRD_JUMP_HEIGHT);
    this.holdImpulseStrength = baseImpulse;
    this.holdContinuousBase = baseImpulse * 0.1;
    this.holdContinuousBonus = baseImpulse * 0.32;
  }

  public click(_coord: ICoordinate): void {
    void _coord;
    if (this.gameState === 'died') return;

    this.state = 'playing';
    this.gameState = 'playing';
    this.bannerInstruction.tap();

    if (this.controlMode === 'hold') {
      this.triggerHoldImpulse();
      return;
    }

    this.bird.flap();
  }

  public mouseDown(coord: ICoordinate): void {
    if (this.gameState === 'died') {
      this.scoreBoard.mouseDown(coord);
      return;
    }

    if (this.controlMode === 'hold') {
      this.holdActive = true;
      this.holdFrames = 0;
    }
  }

  public mouseUp(coord: ICoordinate): void {
    if (this.gameState === 'died') {
      this.scoreBoard.mouseUp(coord);
      return;
    }

    if (this.controlMode === 'hold') {
      this.clearHoldState();
    }
  }
  public startAtKeyBoardEvent(): void {
    if (this.gameState === 'died') this.scoreBoard.triggerPlayATKeyboardEvent();
  }
}
