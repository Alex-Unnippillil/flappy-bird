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
  const devicePixelRatio = window.devicePixelRatio || 1;
  const logicalHeight = Math.max(window.innerHeight - 50, 1);
  const logicalSize = rescaleDim(CANVAS_DIMENSION, {
    height: logicalHeight
  });
  const physicalWidth = Math.round(logicalSize.width * devicePixelRatio);
  const physicalHeight = Math.round(logicalSize.height * devicePixelRatio);

  canvas.style.width = `${logicalSize.width}px`;
  canvas.style.height = `${logicalSize.height}px`;
  canvas.dataset.logicalWidth = String(logicalSize.width);
  canvas.dataset.logicalHeight = String(logicalSize.height);
  canvas.dataset.devicePixelRatio = String(devicePixelRatio);

  canvas.width = physicalWidth;
  canvas.height = physicalHeight;
  virtualCanvas.width = physicalWidth;
  virtualCanvas.height = physicalHeight;

  console.log(
    `Canvas Size: ${logicalSize.width}x${logicalSize.height} (DPR: ${devicePixelRatio})`
  );

  Game.Resize(logicalSize, devicePixelRatio);
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
