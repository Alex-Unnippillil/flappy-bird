import { emit, off, on } from '../events';
import type { GameEventName } from '../events';
import { expectTypeOf } from 'vitest';

declare global {
  interface GameEvents {
    'core:type': { value: number };
    'core:ping': undefined;
  }
}

expectTypeOf<'core:type'>().toMatchTypeOf<GameEventName>();
expectTypeOf<'core:ping'>().toMatchTypeOf<GameEventName>();
expectTypeOf<'core:unknown'>().not.toMatchTypeOf<GameEventName>();

const handleType = (payload: { value: number }) => {
  expectTypeOf(payload).toEqualTypeOf<{ value: number }>();
};

const handlePing = (payload: undefined) => {
  expectTypeOf(payload).toEqualTypeOf<undefined>();
};

on('core:type', handleType);
off('core:type', handleType);
on('core:ping', handlePing);
off('core:ping', handlePing);

emit('core:type', { value: 1 });
emit('core:ping');
emit('core:ping', undefined);

// @ts-expect-error invalid payload shape
emit('core:type');

// @ts-expect-error invalid event name
emit('core:unknown');

// @ts-expect-error listener payload mismatch
on('core:type', (payload: { value: string }) => {
  expectTypeOf(payload).toEqualTypeOf<{ value: string }>();
});

// @ts-expect-error off requires known listener signature
off('core:type', (payload: { value: string }) => {
  expectTypeOf(payload).toEqualTypeOf<{ value: string }>();
});
