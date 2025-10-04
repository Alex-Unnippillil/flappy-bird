export const HUD_PAUSE = "hud:pause" as const;
export const HUD_GAME_OVER = "hud:game-over" as const;

export type HudPauseEventDetail = {
  paused: boolean;
  gameOver?: boolean;
  state?: string;
};

export type HudPauseEvent = CustomEvent<HudPauseEventDetail>;
export const HUD_EVENT_AUDIO_TOGGLED = "hud:audio-toggled";

export interface HudAudioToggleDetail {
  enabled: boolean;
  audioContext: AudioContext | null;
}
export interface ScoreEvent {
  /** The new score value reported by the game loop. */
  value: number;
}

export interface HudEvents {
  score: ScoreEvent;
}

type EventKey = keyof HudEvents;

type Listener<K extends EventKey> = (payload: HudEvents[K]) => void;

type ListenerRegistry = {
  [K in EventKey]?: Set<Listener<K>>;
};

/**
 * Minimal typed event bus for heads-up-display components. Components can
 * subscribe to events and receive strongly typed payloads.
 */
class HudEventBus {
  private listeners: ListenerRegistry = {};

  on<K extends EventKey>(type: K, handler: Listener<K>): () => void {
    const handlers = (this.listeners[type] ??= new Set());
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        delete this.listeners[type];
      }
    };
  }

  emit<K extends EventKey>(type: K, payload: HudEvents[K]): void {
    const handlers = this.listeners[type];
    if (!handlers) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }

  clear(): void {
    this.listeners = {};
  }
}

export const hudEventBus = new HudEventBus();

export function emitScoreEvent(value: number): void {
  hudEventBus.emit("score", { value });
}

export function resetHudEventBus(): void {
  hudEventBus.clear();
}

export type { HudEventBus };
