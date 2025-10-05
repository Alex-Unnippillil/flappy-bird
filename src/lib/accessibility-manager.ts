// File Overview: This module belongs to src/lib/accessibility-manager.ts.
import Game, { IAccessibilityCallbacks } from '../game';

export default class AccessibilityManager {
  private readonly game: Game;
  private readonly canvas: HTMLCanvasElement;
  private readonly root: HTMLElement | null;
  private readonly introScreen: HTMLElement | null;
  private readonly scoreboardScreen: HTMLElement | null;
  private readonly introPlayButton: HTMLButtonElement | null;
  private readonly scoreboardRetryButton: HTMLButtonElement | null;

  constructor(game: Game, canvas: HTMLCanvasElement) {
    this.game = game;
    this.canvas = canvas;
    this.root = document.getElementById('ui-controls');
    this.introScreen = this.root?.querySelector('[data-screen="intro"]') ?? null;
    this.scoreboardScreen = this.root?.querySelector('[data-screen="scoreboard"]') ?? null;
    this.introPlayButton = this.root?.querySelector('#intro-play-button') ?? null;
    this.scoreboardRetryButton = this.root?.querySelector('#scoreboard-retry-button') ?? null;
  }

  public init(): void {
    if (!this.root) return;

    this.toggleScreen(this.introScreen, false);
    this.toggleScreen(this.scoreboardScreen, false);

    const callbacks: IAccessibilityCallbacks = {
      onIntroReady: () => {
        this.toggleScreen(this.introScreen, true);
        this.toggleScreen(this.scoreboardScreen, false);
        window.requestAnimationFrame(() => {
          this.introPlayButton?.focus();
        });
      },
      onGameStart: () => {
        this.toggleScreen(this.introScreen, false);
        this.toggleScreen(this.scoreboardScreen, false);
        window.requestAnimationFrame(() => {
          this.canvas.focus({ preventScroll: true });
        });
      },
      onScoreboardReady: () => {
        this.toggleScreen(this.scoreboardScreen, true);
        window.requestAnimationFrame(() => {
          this.scoreboardRetryButton?.focus();
        });
      },
      onScoreboardHidden: () => {
        this.toggleScreen(this.scoreboardScreen, false);
        window.requestAnimationFrame(() => {
          this.canvas.focus({ preventScroll: true });
        });
      }
    };

    this.game.registerAccessibilityCallbacks(callbacks);

    this.introPlayButton?.addEventListener('click', () => {
      this.game.requestIntroPlayFromAccessibility();
    });

    this.scoreboardRetryButton?.addEventListener('click', () => {
      this.game.requestScoreboardRestartFromAccessibility();
    });
  }

  private toggleScreen(element: HTMLElement | null, visible: boolean): void {
    if (!element) return;

    if (visible) {
      element.hidden = false;
      element.setAttribute('aria-hidden', 'false');
    } else {
      element.hidden = true;
      element.setAttribute('aria-hidden', 'true');
    }
  }
}
