// File Overview: This module belongs to src/index.ts.
import './styles/main.scss';
import gameSpriteIcon from './assets/icon.png';
import '@total-typescript/ts-reset';

import { framer as Framer, rescaleDim } from './utils';
import { CANVAS_DIMENSION } from './constants';
import EventHandler from './events';
import GameObject from './game';
import prepareAssets from './asset-preparation';
import SwOffline from './lib/workbox-work-offline';
import { settings } from './lib/settings';
import type { FpsCapOption } from './lib/settings';

if (process.env.NODE_ENV === 'production') {
  SwOffline();
}

settings.applyThemeToDocument();

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
  document.body.style.backgroundColor = '';
};

//
// Quick Fix. Locking to 60fps
// Quick fix.Long term :)
let running = false;
let frameInterval = 1000 / Math.max(1, settings.get('fpsCap') || 60);
let lastFrameTime = 0;

const tick = (timestamp: number) => {
  if (!running) return;

  if (frameInterval <= 0 || timestamp - lastFrameTime >= frameInterval) {
    lastFrameTime = timestamp;
    GameUpdate();
  }

  window.requestAnimationFrame(tick);
};

const startLoop = () => {
  if (running) return;
  running = true;
  lastFrameTime = performance.now();
  window.requestAnimationFrame(tick);
};

const applyFpsCap = (fps: FpsCapOption) => {
  if (!fps) {
    frameInterval = 0;
    return;
  }

  frameInterval = 1000 / fps;
};

window.addEventListener('DOMContentLoaded', () => {
  loadingScreen.insertBefore(gameIcon, loadingScreen.childNodes[0]);

  prepareAssets(() => {
    isLoaded = true;

    Game.init();

    ScreenResize();

    applyFpsCap(settings.get('fpsCap'));

    Game.setFpsPreferenceListener((fps) => {
      applyFpsCap(fps);
      if (!running) {
        startLoop();
      }
    });

    settings.applyThemeToDocument();

    startLoop();

    if (process.env.NODE_ENV === 'development') removeLoadingScreen();
    else window.setTimeout(removeLoadingScreen, 1000);
  });
});

window.addEventListener('resize', () => {
  if (!isLoaded) return;

  ScreenResize();
});
