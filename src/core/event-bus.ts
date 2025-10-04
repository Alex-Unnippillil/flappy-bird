import type { GameEventName } from './events';

type ListenerCallback<Name extends GameEventName> = (payload: GameEvents[Name]) => void;

type EmitArgs<Name extends GameEventName> = GameEvents[Name] extends undefined
  ? [detail?: GameEvents[Name]]
  : [detail: GameEvents[Name]];

const HAS_DETAIL_FLAG = Symbol('game-event-has-detail');

type DetailAwareEvent<Name extends GameEventName> = CustomEvent<GameEvents[Name]> & {
  [HAS_DETAIL_FLAG]?: boolean;
};

const on = <Name extends GameEventName>(
  eventName: Name,
  listener: ListenerCallback<Name>,
) => {
  const eventListener: EventListener = (event) => {
    const customEvent = event as DetailAwareEvent<Name>;
    const marker = customEvent[HAS_DETAIL_FLAG];
    const payload = marker === false ? (undefined as GameEvents[Name]) : customEvent.detail;
    (listener as (payload: GameEvents[Name]) => void)(payload);
  };

  window.addEventListener(eventName, eventListener);

  return () => {
    window.removeEventListener(eventName, eventListener);
  };
};

const emit = <Name extends GameEventName>(eventName: Name, ...args: EmitArgs<Name>) => {
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

export const bus = {
  on,
  emit,
} as const;

export type { GameEventName };
