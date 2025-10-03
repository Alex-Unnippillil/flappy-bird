export type EventPayload = Record<string, unknown> | void;

export type EventOf<EventMap, K extends keyof EventMap> = EventMap[K] extends void
  ? { type: K }
  : { type: K } & EventMap[K];

export type EventHandler<EventMap, K extends keyof EventMap> = (
  event: EventOf<EventMap, K>,
) => void;

type HandlerMap<EventMap> = {
  [K in keyof EventMap]?: Set<EventHandler<EventMap, K>>;
};

/**
 * A tiny publish/subscribe event bus tailored for deterministic game logic.
 */
export class EventBus<EventMap> {
  private readonly listeners: HandlerMap<EventMap> = {};

  on<K extends keyof EventMap>(type: K, handler: EventHandler<EventMap, K>): () => void {
    let handlers = this.listeners[type];
    if (!handlers) {
      handlers = new Set();
      this.listeners[type] = handlers;
    }

    handlers.add(handler as EventHandler<EventMap, K>);

    return () => {
      handlers?.delete(handler as EventHandler<EventMap, K>);
      if (handlers && handlers.size === 0) {
        delete this.listeners[type];
      }
    };
  }

  emit<K extends keyof EventMap>(event: EventOf<EventMap, K>): void {
    const handlers = this.listeners[event.type];
    if (!handlers) {
      return;
    }

    handlers.forEach((handler) => {
      handler(event as EventOf<EventMap, K>);
    });
  }
}
