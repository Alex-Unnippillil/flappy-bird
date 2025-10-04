export const HUD_RETRY = "HUD_RETRY" as const;

export type HudEvent = typeof HUD_RETRY;

export type HudEventHandler = () => void;

class HudEventBus {
  #listeners: Map<HudEvent, Set<HudEventHandler>> = new Map();

  subscribe(event: HudEvent, handler: HudEventHandler): () => void {
    const handlers = this.#listeners.get(event) ?? new Set();
    handlers.add(handler);
    this.#listeners.set(event, handlers);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.#listeners.delete(event);
      }
    };
  }

  publish(event: HudEvent): void {
    const handlers = this.#listeners.get(event);
    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler();
    }
  }

  clear(): void {
    this.#listeners.clear();
  }
}

export const hudEventBus = new HudEventBus();
