// File Overview: This module belongs to src/workers/messages.ts.
import type { IStoreValue } from '../lib/storage';

export interface SpriteBitmapTransfer {
  name: string;
  bitmap: ImageBitmap;
}

export interface WorkerInitMessage {
  type: 'init';
  canvas: OffscreenCanvas;
  size: IDimension;
  isDev: boolean;
  sprites: SpriteBitmapTransfer[];
  storage: Record<string, IStoreValue | undefined>;
}

export interface FrameMessage {
  type: 'frame';
  time: number;
}

export interface ResizeMessage {
  type: 'resize';
  size: IDimension;
}

export type PointerEventKind = 'click' | 'down' | 'up';

export interface PointerMessage {
  type: 'pointer';
  kind: PointerEventKind;
  position: ICoordinate;
}

export interface KeyboardMessage {
  type: 'keyboard';
  action: 'start';
}

export interface AudioCallbackMessage {
  type: 'audio-callback';
  id: number;
}

export type MainToWorkerMessage =
  | WorkerInitMessage
  | FrameMessage
  | ResizeMessage
  | PointerMessage
  | KeyboardMessage
  | AudioCallbackMessage;

export type AudioAction = 'init' | 'play' | 'volume';

export interface WorkerAudioMessage {
  type: 'audio';
  action: AudioAction;
  sound?: 'die' | 'point' | 'hit' | 'swoosh' | 'wing';
  volume?: number;
  callbackId?: number;
}

export interface WorkerStorageMessage {
  type: 'storage';
  action: 'save';
  key: string;
  value: IStoreValue;
}

export interface WorkerReadyMessage {
  type: 'ready';
}

export type WorkerToMainMessage =
  | WorkerAudioMessage
  | WorkerStorageMessage
  | WorkerReadyMessage;
