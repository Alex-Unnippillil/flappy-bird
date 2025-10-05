// File Overview: This module belongs to src/game.ts.
import BgModel from './model/background';
import BirdModel from './model/bird';
import GamePlay from './screens/gameplay';
import Intro from './screens/intro';
import SettingsScreen from './screens/settings';
import ParentClass from './abstracts/parent-class';
import PipeGenerator from './model/pipe-generator';
import PlatformModel from './model/platform';
import { SFX_VOLUME } from './constants';
import ScreenChanger from './lib/screen-changer';
import Sfx from './model/sfx';
import Storage from './lib/storage';
import FlashScreen from './model/flash-screen';
import { settings, type ControlScheme, type FpsCapOption } from './lib/settings';

export type IGameState = 'intro' | 'game' | 'settings';

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
  private settingsScreen: SettingsScreen;
  private state: IGameState;
  private fpsPreferenceListener?: (fps: FpsCapOption) => void;
  private controlSchemeListener?: (scheme: ControlScheme) => void;
  private controlScheme: ControlScheme;

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
    this.gamePlay = new GamePlay(this);
    this.settingsScreen = new SettingsScreen(this);
    this.state = 'intro';
    this.bgPause = false;
    this.transition = new FlashScreen({
      interval: 700,
      strong: 1,
      style: 'black',
      easing: 'sineWaveHS'
    });
    this.controlScheme = settings.get('controlScheme');

    this.transition.setEvent([0.98, 1], () => {
      this.navigateTo('game');
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
    this.settingsScreen.init();
    this.setEvent();

    this.screenIntro.playButton.active = true;
    this.screenIntro.rankingButton.active = true;

    // Register screens
    this.screenChanger.register('intro', this.screenIntro);
    this.screenChanger.register('game', this.gamePlay);
    this.screenChanger.register('settings', this.settingsScreen);

    settings.subscribe('reducedMotion', (value) => {
      if (value) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    });

    if (settings.get('reducedMotion')) {
      document.body.classList.add('reduced-motion');
    }

    this.settingsScreen.showLauncher();
  }

  public reset(): void {
    this.background.reset();
    this.platform.reset();
    this.Resize(this.canvasSize);
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
    this.transition.Update();
    this.screenChanger.setState(this.state);

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

  public get currentState(): IGameState {
    return this.state;
  }

  public navigateTo(state: IGameState): void {
    this.state = state;

    if (state === 'settings') {
      this.settingsScreen.hideLauncher();
      this.settingsScreen.open();
      this.screenIntro.toggleSpeakerButton.active = false;
      this.screenIntro.playButton.active = false;
      this.screenIntro.rankingButton.active = false;
    } else {
      this.settingsScreen.close();
      if (state === 'intro') {
        this.settingsScreen.showLauncher();
      } else {
        this.settingsScreen.hideLauncher();
      }
      if (state === 'intro') {
        this.screenIntro.playButton.active = true;
        this.screenIntro.rankingButton.active = true;
        this.screenIntro.toggleSpeakerButton.active = true;
      }
    }
  }

  public setFpsPreferenceListener(listener: (fps: FpsCapOption) => void): void {
    this.fpsPreferenceListener = listener;
  }

  public setControlSchemeListener(
    listener: (scheme: ControlScheme) => void
  ): void {
    this.controlSchemeListener = listener;
  }

  public onFpsPreferenceChanged(fps: FpsCapOption): void {
    this.fpsPreferenceListener?.(fps);
  }

  public onControlSchemeChanged(scheme: ControlScheme): void {
    this.controlScheme = scheme;
    this.controlSchemeListener?.(scheme);
  }

  public get currentControlScheme(): ControlScheme {
    return this.controlScheme;
  }
}
