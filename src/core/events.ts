const FEATURE_FLAG_KEY = 'VITE_FF_F02' as const;

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'enable', 'enabled']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off', 'disable', 'disabled']);

const HAS_DETAIL_FLAG = Symbol('game-event-has-detail');

export type GameEventName = keyof GameEvents & string;
export type GameEventListener<Name extends GameEventName> = (payload: GameEvents[Name]) => void;
export type EmitArgs<Name extends GameEventName> = GameEvents[Name] extends undefined
  ? [detail?: GameEvents[Name]]
  : [detail: GameEvents[Name]];

type DetailAwareEvent<Name extends GameEventName> = CustomEvent<GameEvents[Name]> & {
  [HAS_DETAIL_FLAG]?: boolean;
};

type AnyGameEventListener = GameEventListener<GameEventName>;

const NOOP = () => {};

const isWindowAvailable = () => typeof window !== 'undefined';

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return null;
};

const isEventBusEnabled = (): boolean => {
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const raw = meta.env?.[FEATURE_FLAG_KEY];
  return normalizeBoolean(raw) ?? false;
};

const listenerRegistry = new Map<string, WeakMap<AnyGameEventListener, EventListener>>();

const getRegistry = (eventName: string): WeakMap<AnyGameEventListener, EventListener> => {
  let registry = listenerRegistry.get(eventName);
  if (!registry) {
    registry = new WeakMap();
    listenerRegistry.set(eventName, registry);
  }

  return registry;
};

const createEventListener = <Name extends GameEventName>(
  eventName: Name,
  listener: GameEventListener<Name>,
): EventListener => {
  const registry = getRegistry(eventName);
  const existing = registry.get(listener as AnyGameEventListener);
  if (existing) {
    return existing;
  }

  const eventListener: EventListener = (event) => {
    const customEvent = event as DetailAwareEvent<Name>;
    const marker = customEvent[HAS_DETAIL_FLAG];
    const payload = marker === false ? (undefined as GameEvents[Name]) : customEvent.detail;
    (listener as GameEventListener<Name>)(payload);
  };

  registry.set(listener as AnyGameEventListener, eventListener);

  return eventListener;
};

const unregisterListener = <Name extends GameEventName>(
  eventName: Name,
  listener: GameEventListener<Name>,
): EventListener | null => {
  const registry = listenerRegistry.get(eventName);
  if (!registry) {
    return null;
  }

  const eventListener = registry.get(listener as AnyGameEventListener);
  if (!eventListener) {
    return null;
  }

  registry.delete(listener as AnyGameEventListener);
  return eventListener;
};

export const on = <Name extends GameEventName>(
  eventName: Name,
  listener: GameEventListener<Name>,
): (() => void) => {
  if (!isEventBusEnabled() || !isWindowAvailable()) {
    return NOOP;
  }

  const eventListener = createEventListener(eventName, listener);
  window.addEventListener(eventName, eventListener);

  return () => {
    off(eventName, listener);
  };
};

export const off = <Name extends GameEventName>(
  eventName: Name,
  listener: GameEventListener<Name>,
): void => {
  if (!isEventBusEnabled() || !isWindowAvailable()) {
    return;
  }

  const eventListener = unregisterListener(eventName, listener);
  if (!eventListener) {
    return;
  }

  window.removeEventListener(eventName, eventListener);
};

export const emit = <Name extends GameEventName>(
  eventName: Name,
  ...args: EmitArgs<Name>
): void => {
  if (!isEventBusEnabled() || !isWindowAvailable()) {
    return;
  }

  const hasDetail = args.length > 0;
  const detail = args[0];
  const event = hasDetail
    ? new CustomEvent<GameEvents[Name]>(eventName, { detail })
    : new CustomEvent<GameEvents[Name]>(eventName);

  Object.defineProperty(event, HAS_DETAIL_FLAG, {
    value: hasDetail,
  });

  window.dispatchEvent(event);
};
