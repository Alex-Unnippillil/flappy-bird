import type { HudChannel, HudEventPayloads } from "./hud-events";

type HudEventHandler<K extends HudChannel> = (payload: HudEventPayloads[K]) => void;

type HandlerRegistry = {
  [K in HudChannel]?: Set<HudEventHandler<K>>;
};

const registry: HandlerRegistry = {};

function getHandlers<K extends HudChannel>(channel: K): Set<HudEventHandler<K>> | undefined {
  return registry[channel] as Set<HudEventHandler<K>> | undefined;
}

function ensureHandlers<K extends HudChannel>(channel: K): Set<HudEventHandler<K>> {
  let handlers = getHandlers(channel);

  if (!handlers) {
    handlers = new Set<HudEventHandler<K>>();
    registry[channel] = handlers as Set<HudEventHandler<typeof channel>>;
  }

  return handlers;
}

export function subscribe<K extends HudChannel>(
  channel: K,
  handler: HudEventHandler<K>,
): () => void {
  const handlers = ensureHandlers(channel);
  handlers.add(handler);

  return () => {
    unsubscribe(channel, handler);
  };
}

export function unsubscribe<K extends HudChannel>(
  channel: K,
  handler: HudEventHandler<K>,
): boolean {
  const handlers = getHandlers(channel);

  if (!handlers) {
    return false;
  }

  const removed = handlers.delete(handler);

  if (handlers.size === 0) {
    delete registry[channel];
  }

  return removed;
}

export function publish<K extends HudChannel>(
  channel: K,
  payload: HudEventPayloads[K],
): boolean {
  const handlers = getHandlers(channel);

  if (!handlers || handlers.size === 0) {
    return false;
  }

  handlers.forEach((handler) => {
    handler(payload);
  });

  return true;
}

export function hasSubscribers(channel: HudChannel): boolean {
  const handlers = getHandlers(channel);
  return !!handlers && handlers.size > 0;
}

export function resetHudBus(): void {
  (Object.keys(registry) as HudChannel[]).forEach((channel) => {
    delete registry[channel];
  });
}
