// File Overview: This module belongs to src/index.ts.
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
const [game_running, game_start] = createRAF(targetFPS(GameUpdate, 60));

window.addEventListener('DOMContentLoaded', () => {
  loadingScreen.insertBefore(gameIcon, loadingScreen.childNodes[0]);

  prepareAssets(() => {
    isLoaded = true;

    Game.init();

    ScreenResize();

    // raf(GameUpdate); Issue #16
    if (!game_running()) game_start(); // Quick fix. Long term :)

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
