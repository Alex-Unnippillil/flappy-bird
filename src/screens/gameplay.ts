// File Overview: This module belongs to src/screens/gameplay.ts.
/**
 * Gameplay screen orchestrating the active run experience once ScreenChanger
 * hands control off from the intro. It coordinates BirdModel, pipes, banners,
 * score display, ghost playback, and transition overlays while exposing the
 * ParentClass lifecycle contract so the screen can be resized or paused and
 * later re-mounted without state leakage.
 *
 * Initialization provisions all dependent models (bird, pipe generator,
 * countdown, instructions, scoreboard, flash overlays) and connects scoreboard
 * callbacks to FlashScreen transitions that notify ScreenChanger when the
 * player restarts. Resetting rewinds environmental models and clears ghost
 * samples to maintain deterministic restarts.
 *
 * Event handlers gate tap/click input based on death state: active runs convert
 * clicks into flap commands and start ghost recording, while post-death input
 * is routed exclusively to the scoreboard so the replay and restart buttons
 * remain responsive. UX-specific touches include delaying scoreboard reveal
 * behind paired swoosh SFX, pausing the background when the bird dies, hiding
 * the bird during scoreboard presentation, and rendering a translucent ghost
 * trail to preview the prior attempt for coaching-oriented feedback.
 */

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
import SpriteDestructor from '../lib/sprite-destructor';

interface BirdGhostSample {
  frame: number;
  time: number;
  position: ICoordinate;
  rotation: number;
  wingState: number;
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
  private ghostSpriteFrames: HTMLCanvasElement[];
  private ghostEnabled: boolean;

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
    this.ghostSpriteFrames = [];
    this.ghostEnabled = true;

    this.transition.setEvent([0.99, 1], this.reset.bind(this));

    this.scoreBoard.onToggleGhost((enabled: boolean) => {
      this.ghostEnabled = enabled;

      if (!enabled) {
        this.ghostPlaybackStart = null;
        return;
      }

      if (
        this.state === 'playing' &&
        this.gameState !== 'died' &&
        this.ghostPath &&
        this.ghostPath.length > 0
      ) {
        this.ghostPlaybackStart = performance.now();
        this.ghostPlaybackIndex = 0;
      }
    });
  }

  public init(): void {
    this.bird.init();
    this.count.init();
    this.bannerInstruction.init();
    this.scoreBoard.init();
    this.setButtonEvent();
    this.flashScreen.init();
    this.transition.init();
    this.prepareGhostSprites();
    this.ghostEnabled = this.scoreBoard.isGhostEnabled();
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
    this.ghostEnabled = this.scoreBoard.isGhostEnabled();
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

    if (this.ghostEnabled && this.ghostPath && this.ghostPath.length > 0) {
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
      rotation: this.bird.getRotation(),
      wingState: this.bird.getWingState()
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
      !this.ghostEnabled ||
      !this.ghostPath ||
      this.ghostPath.length === 0 ||
      this.ghostPlaybackStart === null
    ) {
      return;
    }

    if (this.ghostSpriteFrames.length === 0) {
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
    const drawWidth = size.width * 2;
    const drawHeight = size.height * 2;
    const sprite = this.getGhostSpriteFrame(current.wingState);

    context.save();
    context.translate(x, y);
    context.rotate((rotation * Math.PI) / 180);
    context.globalAlpha = 0.5;
    context.shadowColor = 'rgba(120, 136, 176, 0.38)';
    context.shadowBlur = Math.max(drawWidth, drawHeight) * 0.45;
    context.shadowOffsetY = drawHeight * 0.08;
    context.drawImage(sprite, -size.width, -size.height, drawWidth, drawHeight);
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.shadowColor = 'transparent';
    context.globalAlpha = 0.28;
    context.fillStyle = 'rgba(212, 218, 238, 0.6)';
    context.beginPath();
    context.ellipse(0, drawHeight * 0.38, size.width * 0.85, size.height * 0.55, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();

    this.drawGhostTrail(context);
  }

  private prepareGhostSprites(): void {
    const frames: HTMLCanvasElement[] = [];
    const wingKeys: ('up' | 'mid' | 'down')[] = ['up', 'mid', 'down'];

    for (const key of wingKeys) {
      try {
        const base = SpriteDestructor.asset(`bird-yellow-${key}`);
        const canvas = document.createElement('canvas');
        canvas.width = base.width;
        canvas.height = base.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          continue;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.drawImage(base, 0, 0, base.width, base.height);
        ctx.globalCompositeOperation = 'source-atop';
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#f4f6fb');
        gradient.addColorStop(0.45, '#c9cedd');
        gradient.addColorStop(1, '#8f95a9');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.24;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        frames.push(canvas);
      } catch (err) {}
    }

    this.ghostSpriteFrames = frames;
  }

  private getGhostSpriteFrame(wingState: number): HTMLCanvasElement {
    if (this.ghostSpriteFrames.length < 3) {
      return this.ghostSpriteFrames[0] ?? document.createElement('canvas');
    }

    const index = Math.max(0, Math.min(2, wingState));
    return this.ghostSpriteFrames[index];
  }

  private drawGhostTrail(context: CanvasRenderingContext2D): void {
    if (!this.ghostPath || this.ghostPlaybackIndex < 1) {
      return;
    }

    const endIndex = this.ghostPlaybackIndex;
    const startIndex = Math.max(0, endIndex - 24);

    context.save();
    const start = this.ghostPath[startIndex].position;
    const end = this.ghostPath[endIndex].position;
    const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, 'rgba(200, 208, 230, 0)');
    gradient.addColorStop(1, 'rgba(200, 210, 235, 0.45)');
    context.strokeStyle = gradient;
    context.lineWidth = Math.max(2, this.canvasSize.width * 0.005);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = 0.6;
    context.beginPath();
    context.moveTo(start.x, start.y);
    for (let i = startIndex + 1; i <= endIndex; i++) {
      const sample = this.ghostPath[i].position;
      context.lineTo(sample.x, sample.y);
    }
    context.stroke();

    const sparkleCount = Math.max(2, Math.floor((endIndex - startIndex) / 5));
    context.globalAlpha = 0.4;
    context.fillStyle = 'rgba(224, 232, 255, 0.7)';
    for (let i = 0; i < sparkleCount; i++) {
      const index = Math.max(startIndex, endIndex - i * 4);
      const sample = this.ghostPath[index].position;
      const radius = Math.max(2, this.canvasSize.width * 0.004) * (1 - i / sparkleCount);
      context.beginPath();
      context.arc(sample.x, sample.y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }
}
