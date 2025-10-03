export const HUD_EVENTS = {
  score: 'hud:score',
  gameOver: 'hud:game-over',
  pause: 'hud:pause',
} as const;

export type HudEventName = (typeof HUD_EVENTS)[keyof typeof HUD_EVENTS];

export type HudEventHandler<Payload = unknown> = (payload: Payload) => void;

const subscribers = new Map<HudEventName, Set<HudEventHandler>>();

export function publishHudEvent<EventName extends HudEventName>(
  event: EventName,
  payload: Parameters<HudEventHandler>[0]
): void {
  const handlers = subscribers.get(event);
  if (!handlers) {
    return;
  }

  handlers.forEach((handler) => {
    handler(payload);
  });
}

export function subscribeToHudEvent<EventName extends HudEventName>(
  event: EventName,
  handler: HudEventHandler
): () => void {
  let handlers = subscribers.get(event);
  if (!handlers) {
    handlers = new Set();
    subscribers.set(event, handlers);
  }

  handlers.add(handler);

  return () => {
    const currentHandlers = subscribers.get(event);
    if (!currentHandlers) {
      return;
    }

    currentHandlers.delete(handler);

    if (currentHandlers.size === 0) {
      subscribers.delete(event);
    }
  };
}

export function clearHudBus(): void {
  subscribers.clear();
}
