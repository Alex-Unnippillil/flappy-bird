export type EventHandler<Payload> = (payload: Payload) => void;

export interface EventBus<EventMap extends Record<string, any>> {
  on<EventName extends keyof EventMap>(
    eventName: EventName,
    handler: EventHandler<EventMap[EventName]>
  ): () => void;
  emit<EventName extends keyof EventMap>(
    eventName: EventName,
    payload: EventMap[EventName]
  ): void;
}

export function createEventBus<EventMap extends Record<string, any>>(): EventBus<EventMap> {
  const listeners = new Map<keyof EventMap, Set<EventHandler<any>>>();

  return {
    on(eventName, handler) {
      const handlers = listeners.get(eventName) ?? new Set<EventHandler<any>>();
      handlers.add(handler);
      listeners.set(eventName, handlers);

      return () => {
        const currentHandlers = listeners.get(eventName);
        currentHandlers?.delete(handler);
        if (currentHandlers?.size === 0) {
          listeners.delete(eventName);
        }
      };
    },
    emit(eventName, payload) {
      const handlers = listeners.get(eventName);
      if (!handlers) {
        return;
      }

      handlers.forEach((handler) => {
        handler(payload);
      });
    },
  };
}
