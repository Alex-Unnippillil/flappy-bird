// File Overview: This module belongs to src/index.ts.
import './styles/main.scss';
import gameSpriteIcon from './assets/icon.png';
import '@total-typescript/ts-reset';

import { framer as Framer, rescaleDim } from './utils';
import { CANVAS_DIMENSION } from './constants';
import EventHandler from './events';
import GameObject from './game';
import prepareAssets from './asset-preparation';
import createRAF from '@solid-primitives/raf';
import SwOffline from './lib/workbox-work-offline';
import {
  getDefaultFpsCap,
  getFpsCap,
  loadFpsCap,
  onFpsCapChange
} from './lib/settings';

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

const MAX_FRAME_DELTA = 1000 / 12; // Clamp to avoid massive jumps after tab switching.

const initialCap = loadFpsCap();
let targetFrameDuration = 1000 / initialCap;
let renderAccumulator = targetFrameDuration;
let lastTimestamp = performance.now();

const applyFpsCap = (fpsCap: number) => {
  const safeCap = fpsCap > 0 ? fpsCap : getDefaultFpsCap();
  targetFrameDuration = 1000 / safeCap;
  renderAccumulator = targetFrameDuration;
};

onFpsCapChange(applyFpsCap);

const GameUpdate: FrameRequestCallback = (timestamp) => {
  if (!isLoaded) return;

  const rawDelta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  const delta = Math.min(rawDelta, MAX_FRAME_DELTA);

  Game.Update(delta);

  renderAccumulator += delta;

  if (renderAccumulator >= targetFrameDuration) {
    renderAccumulator %= targetFrameDuration;
    Game.Display();
    physicalContext.drawImage(virtualCanvas, 0, 0);

    if (process.env.NODE_ENV === 'development') fps.mark();
  }
};

const ScreenResize = () => {
  const sizeResult = rescaleDim(CANVAS_DIMENSION, {
    height: window.innerHeight * 2 - 50
  });

  canvas.style.maxWidth = String(sizeResult.width / 2) + 'px';
  canvas.style.maxHeight = String(sizeResult.height / 2) + 'px';

  canvas.height = sizeResult.height;
  canvas.width = sizeResult.width;
  virtualCanvas.height = sizeResult.height;
  virtualCanvas.width = sizeResult.width;

  console.log(`Canvas Size: ${sizeResult.width}x${sizeResult.height}`);

  Game.Resize(sizeResult);
};

const removeLoadingScreen = () => {
  EventHandler(Game, canvas);
  loadingScreen.style.display = 'none';
  document.body.style.backgroundColor = 'rgba(28, 28, 30, 1)';
};

const [game_running, game_start] = createRAF(GameUpdate);

window.addEventListener('DOMContentLoaded', () => {
  loadingScreen.insertBefore(gameIcon, loadingScreen.childNodes[0]);

  prepareAssets(() => {
    isLoaded = true;

    Game.init();

    ScreenResize();

    Game.Update(0);
    Game.Display();
    physicalContext.drawImage(virtualCanvas, 0, 0);

    lastTimestamp = performance.now();
    applyFpsCap(getFpsCap());

    if (!game_running()) game_start();

    if (process.env.NODE_ENV === 'development') removeLoadingScreen();
    else window.setTimeout(removeLoadingScreen, 1000);
  });
});

window.addEventListener('resize', () => {
  if (!isLoaded) return;

  ScreenResize();
});
