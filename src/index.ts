/**
 * App bootstrap roadmap
 * ---------------------
 * 1. Styles, resets, and assets are wired up first so DOM rendering and sprite
 *    loading behave consistently across browsers.
 * 2. In production we immediately invoke `SwOffline` (lib/workbox-work-offline)
 *    to register the Workbox-powered service worker, while development skips
 *    registration to preserve hot reloads.
 * 3. A virtual `<canvas>` is created as the authoritative render target for the
 *    `GameObject` instance; the physical canvas simply mirrors it each frame so
 *    we can swap buffers cheaply and run the FPS overlay via `Framer` from
 *    `utils` when `NODE_ENV === 'development'`.
 * 4. `ScreenResize` computes DPR-aware sizing with `rescaleDim`, keeping the
 *    virtual and physical canvases in sync across resize, orientation, and
 *    visual viewport events before handing the new dimensions to the game.
 * 5. `prepareAssets` gates initialization—once assets are ready we init the
 *    game, start a throttled RAF loop from `@solid-primitives/raf` targeting
 *    60 FPS, and remove the loading screen. Development removes it instantly
 *    while production keeps a short delay for polish.
 */
import './styles/main.scss';
import gameSpriteIcon from './assets/icon.png';
import '@total-typescript/ts-reset';

import { framer as Framer, rescaleDim } from './utils';
import { CANVAS_DIMENSION } from './constants';
import EventHandler from './events';
import GameObject from './game';
import prepareAssets from './asset-preparation';
import createRAF, { targetFPS } from '@solid-primitives/raf';
import SwOffline from './lib/workbox-work-offline';
import WebSfx from './lib/web-sfx';

if (process.env.NODE_ENV === 'production') {
  SwOffline();
}

/**
 * Enabling desynchronized to reduce latency
 * but the frame tearing may experience so
 * we'll need double buffer to atleast reduce
 * the frame tearing
 * */
const virtualCanvas = document.createElement('canvas');
const gameIcon = document.createElement('img');
const canvas = document.querySelector<HTMLCanvasElement>('#main-canvas')!;
const physicalContext = canvas.getContext('2d')!;
const loadingScreen = document.querySelector<HTMLDivElement>('#loading-modal')!;
const Game = new GameObject(virtualCanvas);
const fps = new Framer(Game.context);

let isLoaded = false;

gameIcon.src = gameSpriteIcon;

// prettier-ignore
fps.text({ x: 50, y: 50 }, '', ' Cycle');
// prettier-ignore
fps.container({ x: 10, y: 10}, { x: 230, y: 70});

const GameUpdate = (): void => {
  physicalContext.drawImage(virtualCanvas, 0, 0);

  Game.Update();
  Game.Display();

  if (process.env.NODE_ENV === 'development') fps.mark();

  // raf(GameUpdate); Issue #16
};

const ScreenResize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const viewport = window.visualViewport;
  const cssWidth = viewport?.width ?? window.innerWidth;
  const cssHeight = viewport?.height ?? window.innerHeight;

  const maxWidth = Math.max(cssWidth, 320) * dpr;
  const maxHeight = Math.max(cssHeight, 480) * dpr;
  const canvasRatio = CANVAS_DIMENSION.width / CANVAS_DIMENSION.height;
  const viewportRatio = maxWidth / maxHeight;

  const scaledDimension =
    viewportRatio > canvasRatio
      ? rescaleDim(CANVAS_DIMENSION, { height: maxHeight })
      : rescaleDim(CANVAS_DIMENSION, { width: maxWidth });

  const displayWidth = scaledDimension.width / dpr;
  const displayHeight = scaledDimension.height / dpr;

  canvas.style.maxWidth = `${displayWidth}px`;
  canvas.style.maxHeight = `${displayHeight}px`;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  canvas.width = Math.round(scaledDimension.width);
  canvas.height = Math.round(scaledDimension.height);
  virtualCanvas.width = canvas.width;
  virtualCanvas.height = canvas.height;

  console.log(`Canvas Size: ${canvas.width}x${canvas.height}`);

  Game.Resize({ width: canvas.width, height: canvas.height });
};

const removeLoadingScreen = () => {
  EventHandler(Game, canvas);
  loadingScreen.style.display = 'none';
  document.body.style.backgroundColor = 'rgba(28, 28, 30, 1)';
};

//
// Quick Fix. Locking to 60fps
// Quick fix.Long term :)
const [game_running, game_start, game_stop] = createRAF(targetFPS(GameUpdate, 60));
const VISIBILITY_PAUSE_REASON = 'visibility';

const resumeGameLoopIfAppropriate = () => {
  if (!isLoaded) return;
  if (Game.isPaused) return;
  if (!game_running()) game_start();
};

const handleVisibilityChange = () => {
  const isHidden = document.visibilityState === 'hidden';

  Game.togglePause(isHidden, VISIBILITY_PAUSE_REASON);
  void WebSfx.toggleSuspend(isHidden, VISIBILITY_PAUSE_REASON);

  if (isHidden) {
    if (game_running()) game_stop();
  } else {
    resumeGameLoopIfAppropriate();
  }
};

if (document.visibilityState === 'hidden') {
  Game.togglePause(true, VISIBILITY_PAUSE_REASON);
  void WebSfx.toggleSuspend(true, VISIBILITY_PAUSE_REASON);
}

document.addEventListener('visibilitychange', handleVisibilityChange);

window.addEventListener('DOMContentLoaded', () => {
  loadingScreen.insertBefore(gameIcon, loadingScreen.childNodes[0]);

  prepareAssets(() => {
    isLoaded = true;

    Game.init();

    ScreenResize();

    // raf(GameUpdate); Issue #16
    resumeGameLoopIfAppropriate();

    if (process.env.NODE_ENV === 'development') removeLoadingScreen();
    else window.setTimeout(removeLoadingScreen, 1000);
  });
});

window.addEventListener('resize', () => {
  if (!isLoaded) return;

  ScreenResize();
});

window.addEventListener('orientationchange', () => {
  if (!isLoaded) return;

  window.setTimeout(ScreenResize, 0);
});

window.visualViewport?.addEventListener('resize', () => {
  if (!isLoaded) return;

  ScreenResize();
});

window.visualViewport?.addEventListener('scroll', () => {
  if (!isLoaded) return;

  ScreenResize();
});
