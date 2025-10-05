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

interface BirdGhostSample {
  frame: number;
  time: number;
  position: ICoordinate;
  rotation: number;
}

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
  private currentRunSamples: BirdGhostSample[];
  private ghostPath: BirdGhostSample[] | null;
  private ghostPlaybackStart: number | null;
  private ghostPlaybackIndex: number;
  private frameIndex: number;
  private runStartTime: number | null;
  private ghostDuration: number;
  private hasSavedGhost: boolean;

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
    this.currentRunSamples = [];
    this.ghostPath = null;
    this.ghostPlaybackStart = null;
    this.ghostPlaybackIndex = 0;
    this.frameIndex = 0;
    this.runStartTime = null;
    this.ghostDuration = 0;
    this.hasSavedGhost = false;

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
    this.currentRunSamples = [];
    this.frameIndex = 0;
    this.runStartTime = null;
    this.hasSavedGhost = false;
    this.ghostPlaybackStart = null;
    this.ghostPlaybackIndex = 0;
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
    this.recordFrameSample();

    if (this.bird.isDead(this.pipeGenerator.pipes)) {
      this.flashScreen.reset();
      this.flashScreen.start();

      this.gameState = 'died';
      this.finalizeGhostRun();

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
    this.displayGhost(context);

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

  public click(coordinate: ICoordinate): void {
    void coordinate;
    if (this.gameState === 'died') return;

    const shouldStartRun = this.state !== 'playing';
    this.state = 'playing';
    this.gameState = 'playing';
    if (shouldStartRun) {
      this.startRunRecording();
    }
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

  private startRunRecording(): void {
    const now = performance.now();
    this.currentRunSamples = [];
    this.frameIndex = 0;
    this.runStartTime = now;
    this.hasSavedGhost = false;

    if (this.ghostPath && this.ghostPath.length > 0) {
      this.ghostPlaybackStart = now;
      this.ghostPlaybackIndex = 0;
    } else {
      this.ghostPlaybackStart = null;
      this.ghostPlaybackIndex = 0;
    }
  }

  private recordFrameSample(): void {
    if (
      this.state !== 'playing' ||
      this.runStartTime === null ||
      !this.bird.alive
    ) {
      return;
    }

    const time = performance.now() - this.runStartTime;
    this.currentRunSamples[this.frameIndex] = {
      frame: this.frameIndex,
      time,
      position: { ...this.bird.coordinate },
      rotation: this.bird.getRotation()
    };

    this.frameIndex += 1;
  }

  private finalizeGhostRun(): void {
    if (this.hasSavedGhost) return;

    if (this.currentRunSamples.length > 0) {
      this.ghostPath = this.currentRunSamples.slice(0, this.frameIndex);
      const lastSample = this.ghostPath[this.ghostPath.length - 1];
      this.ghostDuration = lastSample.time;
    } else {
      this.ghostPath = null;
      this.ghostDuration = 0;
    }

    this.hasSavedGhost = true;
    this.currentRunSamples = [];
    this.frameIndex = 0;
    this.runStartTime = null;
    this.ghostPlaybackStart = null;
    this.ghostPlaybackIndex = 0;
  }

  private displayGhost(context: CanvasRenderingContext2D): void {
    if (
      !this.ghostPath ||
      this.ghostPath.length === 0 ||
      this.ghostPlaybackStart === null
    ) {
      return;
    }

    if (this.ghostDuration <= 0) {
      this.ghostPlaybackStart = null;
      return;
    }

    const elapsed = performance.now() - this.ghostPlaybackStart;

    if (elapsed > this.ghostDuration) {
      this.ghostPlaybackStart = null;
      this.ghostPlaybackIndex = 0;
      return;
    }

    while (
      this.ghostPlaybackIndex + 1 < this.ghostPath.length &&
      this.ghostPath[this.ghostPlaybackIndex + 1].time <= elapsed
    ) {
      this.ghostPlaybackIndex += 1;
    }

    const current = this.ghostPath[this.ghostPlaybackIndex];

    let x = current.position.x;
    let y = current.position.y;
    let rotation = current.rotation;

    if (this.ghostPlaybackIndex + 1 < this.ghostPath.length) {
      const next = this.ghostPath[this.ghostPlaybackIndex + 1];
      if (next.time > current.time) {
        const progress = (elapsed - current.time) / (next.time - current.time);
        x += (next.position.x - current.position.x) * progress;
        y += (next.position.y - current.position.y) * progress;
        rotation += (next.rotation - current.rotation) * progress;
      }
    }

    const size = this.bird.getSize();
    const radius = Math.max(size.width, size.height) * 0.6;

    context.save();
    context.globalAlpha = 0.35;
    context.translate(x, y);
    context.rotate((rotation * Math.PI) / 180);
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.ellipse(0, 0, radius, radius * 0.75, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();

    if (this.ghostPlaybackIndex > 0) {
      context.save();
      context.globalAlpha = 0.15;
      context.strokeStyle = '#ffffff';
      context.lineWidth = 2;
      context.beginPath();
      const start = this.ghostPath[0].position;
      context.moveTo(start.x, start.y);
      for (let i = 1; i <= this.ghostPlaybackIndex; i++) {
        const sample = this.ghostPath[i].position;
        context.lineTo(sample.x, sample.y);
      }
      context.stroke();
      context.restore();
    }
  }
}
