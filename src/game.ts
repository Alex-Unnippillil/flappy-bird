// File Overview: This module belongs to src/game.ts.
import BgModel from './model/background';
import BirdModel from './model/bird';
import GamePlay from './screens/gameplay';
import Intro from './screens/intro';
import ParentClass from './abstracts/parent-class';
import PipeGenerator from './model/pipe-generator';
import PlatformModel from './model/platform';
import { SFX_VOLUME } from './constants';
import ScreenChanger from './lib/screen-changer';
import Sfx from './model/sfx';
import Storage from './lib/storage';
import FlashScreen from './model/flash-screen';

export type IGameState = 'intro' | 'game';

export default class Game extends ParentClass {
  public background: BgModel;
  public platform: PlatformModel;
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public pipeGenerator: PipeGenerator;
  public bgPause: boolean;
  private screenChanger: ScreenChanger;
  private transition: FlashScreen;
  private screenIntro: Intro;
  private gamePlay: GamePlay;
  private state: IGameState;
  private paused: boolean;
  private pendingPauseOverlaySize?: IDimension;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.screenChanger = new ScreenChanger();
    this.background = new BgModel();
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d', {
      desynchronized: true,
      alpha: false
    })!;
    this.platform = new PlatformModel();
    this.pipeGenerator = new PipeGenerator();
    this.screenIntro = new Intro();
    this.paused = false;
    this.pendingPauseOverlaySize = void 0;
    this.gamePlay = new GamePlay(this, this.queuePauseOverlay.bind(this));
    this.state = 'intro';
    this.bgPause = false;
    this.transition = new FlashScreen({
      interval: 700,
      strong: 1,
      style: 'black',
      easing: 'sineWaveHS'
    });

    this.transition.setEvent([0.98, 1], () => {
      this.state = 'game';
    });
  }

  public init(): void {
    new Storage(); // Init first
    this.background.init();
    this.platform.init();
    this.transition.init();

    void Sfx.init();
    Sfx.volume(SFX_VOLUME);

    this.screenIntro.init();
    this.gamePlay.init();
    this.setEvent();

    this.screenIntro.playButton.active = true;
    this.screenIntro.rankingButton.active = true;

    // Register screens
    this.screenChanger.register('intro', this.screenIntro);
    this.screenChanger.register('game', this.gamePlay);
  }

  public reset(): void {
    this.background.reset();
    this.platform.reset();
    this.Resize(this.canvasSize);
    this.setPaused(false);
  }

  public Resize({ width, height }: IDimension): void {
    super.resize({ width, height });
    this.background.resize(this.canvasSize);
    this.platform.resize(this.canvasSize);
    this.transition.resize(this.canvasSize);
    BirdModel.platformHeight = this.platform.platformSize.height;

    this.pipeGenerator.resize({
      max: height - this.platform.platformSize.height,
      width: width,
      height: height
    });

    this.screenIntro.resize(this.canvasSize);
    this.gamePlay.resize(this.canvasSize);
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public Update(): void {
    this.screenChanger.setState(this.state);

    if (this.paused && this.state === 'game') {
      return;
    }

    this.transition.Update();

    if (!this.bgPause) {
      this.background.Update();
      this.platform.Update();
    }

    this.screenChanger.Update();
  }

  public Display(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Remove smoothing effect of an image
    this.context.imageSmoothingEnabled = false;
    this.context.imageSmoothingQuality = 'high';

    this.screenChanger.setState(this.state);
    this.background.Display(this.context);

    for (const pipe of this.pipeGenerator.pipes) {
      pipe.Display(this.context);
    }

    this.platform.Display(this.context);
    this.screenChanger.Display(this.context);
    this.transition.Display(this.context);

    if (this.paused && this.state === 'game') {
      const size = this.pendingPauseOverlaySize ?? this.canvasSize;
      this.renderPauseOverlay(size);
      this.pendingPauseOverlaySize = void 0;
      this.drawPauseBanner(this.context);
    }
  }

  public setEvent(): void {
    this.screenIntro.playButton.onClick(() => {
      if (this.state !== 'intro') return;

      // Deactivate buttons
      this.screenIntro.playButton.active = false;
      this.screenIntro.rankingButton.active = false;
      this.screenIntro.toggleSpeakerButton.active = false;

      this.transition.reset();
      this.transition.start();
    });
  }

  public onClick({ x, y }: ICoordinate): void {
    if (this.state === 'game') {
      this.gamePlay.click({ x, y });
    }
  }

  public mouseDown({ x, y }: ICoordinate): void {
    this.screenIntro.mouseDown({ x, y });
    this.gamePlay.mouseDown({ x, y });
  }

  public mouseUp({ x, y }: ICoordinate): void {
    this.screenIntro.mouseUp({ x, y });
    this.gamePlay.mouseUp({ x, y });
  }

  public startAtKeyBoardEvent(): void {
    if (this.state === 'intro') this.screenIntro.startAtKeyBoardEvent();
    else this.gamePlay.startAtKeyBoardEvent();
  }

  public togglePause(force?: boolean): boolean {
    const desired = typeof force === 'boolean' ? force : !this.paused;

    if (this.state !== 'game') {
      this.setPaused(false);
      return this.paused;
    }

    this.setPaused(desired);
    return this.paused;
  }

  public get isPaused(): boolean {
    return this.paused;
  }

  public get currentState(): IGameState {
    return this.state;
  }

  private setPaused(value: boolean): void {
    if (this.paused === value) {
      if (!value) {
        this.pendingPauseOverlaySize = void 0;
      }
      this.dispatchPauseEvent(value);
      return;
    }

    this.paused = value;
    if (!value) {
      this.pendingPauseOverlaySize = void 0;
    }
    this.dispatchPauseEvent(value);
  }

  private dispatchPauseEvent(paused: boolean): void {
    window.dispatchEvent(
      new CustomEvent('game:pause', {
        detail: { paused }
      })
    );
  }

  private queuePauseOverlay(
    _context: CanvasRenderingContext2D,
    size: IDimension
  ): void {
    this.pendingPauseOverlaySize = size;
  }

  private renderPauseOverlay(size: IDimension): void {
    this.context.save();
    this.context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.context.fillRect(0, 0, size.width, size.height);

    const cardWidth = size.width * 0.6;
    const cardHeight = size.height * 0.32;
    const cardX = (size.width - cardWidth) / 2;
    const cardY = (size.height - cardHeight) / 2;

    this.context.fillStyle = 'rgba(28, 28, 30, 0.92)';
    this.context.fillRect(cardX, cardY, cardWidth, cardHeight);
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.context.lineWidth = Math.max(2, size.width * 0.004);
    this.context.strokeRect(cardX, cardY, cardWidth, cardHeight);

    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = 'rgba(255, 255, 255, 0.95)';

    const titleSize = Math.max(24, size.height * 0.08);
    const subtitleSize = Math.max(14, size.height * 0.04);

    this.context.font = `${titleSize}px 'Arial', sans-serif`;
    this.context.fillText('Paused', size.width / 2, cardY + cardHeight * 0.4);

    this.context.font = `${subtitleSize}px 'Arial', sans-serif`;
    this.context.fillText(
      'Press P or tap the pause button to resume',
      size.width / 2,
      cardY + cardHeight * 0.65
    );

    this.context.restore();
  }

  private drawPauseBanner(context: CanvasRenderingContext2D): void {
    context.save();
    const bannerHeight = Math.max(30, this.canvasSize.height * 0.08);
    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
    context.fillRect(0, 0, this.canvasSize.width, bannerHeight);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.font = `${Math.max(18, this.canvasSize.height * 0.045)}px 'Arial', sans-serif`;
    context.fillText('Game Paused', this.canvasSize.width / 2, bannerHeight / 2);
    context.restore();
  }
}
