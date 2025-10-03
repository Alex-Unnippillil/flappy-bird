import { HUD_EVENTS, HudEventName, publishHudEvent } from './hud-bus';
import { isHudEnabled } from './hud-settings';

export interface ScoreEventPayload {
  delta: number;
}

export type GameOverPayload = {
  score: number;
  bestScore: number;
  reason?: string;
  [key: string]: unknown;
};

export interface PauseEventPayload {
  isPaused: boolean;
}

function dispatchIfEnabled<EventName extends HudEventName, Payload>(
  event: EventName,
  payload: Payload
): void {
  if (!isHudEnabled()) {
    return;
  }

  publishHudEvent(event, payload);
}

export function onScore(delta: number): void {
  const payload: ScoreEventPayload = { delta };
  dispatchIfEnabled(HUD_EVENTS.score, payload);
}

export function onGameOver(payload: GameOverPayload): void {
  dispatchIfEnabled(HUD_EVENTS.gameOver, payload);
}

export function onPause(isPaused: boolean): void {
  const payload: PauseEventPayload = { isPaused };
  dispatchIfEnabled(HUD_EVENTS.pause, payload);
}

export const hud = {
  onScore,
  onGameOver,
  onPause,
} as const;
