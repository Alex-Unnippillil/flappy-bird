import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AriaAnnouncer } from './AriaAnnouncer';

const getLiveRegion = (announcer: AriaAnnouncer) => announcer.element;

describe('AriaAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('debounces medal announcements to the latest message', () => {
    const announcer = new AriaAnnouncer({ medalDebounceMs: 250 });

    announcer.announceMedal('Bronze medal unlocked');
    announcer.announceMedal('Silver medal unlocked');

    expect(getLiveRegion(announcer).textContent).toBe('');

    vi.advanceTimersByTime(249);
    expect(getLiveRegion(announcer).textContent).toBe('');

    vi.advanceTimersByTime(1);
    expect(getLiveRegion(announcer).textContent).toBe('Silver medal unlocked');
  });

  it('announces sequential medal updates when outside debounce window', () => {
    const announcer = new AriaAnnouncer({ medalDebounceMs: 100 });

    announcer.announceMedal('Bronze medal unlocked');
    vi.advanceTimersByTime(100);
    expect(getLiveRegion(announcer).textContent).toBe('Bronze medal unlocked');

    announcer.announceMedal('Silver medal unlocked');
    vi.advanceTimersByTime(100);
    expect(getLiveRegion(announcer).textContent).toBe('Silver medal unlocked');
  });

  it('ignores duplicate announcements that were recently spoken', () => {
    const announcer = new AriaAnnouncer({ recentMessageLimit: 2 });

    announcer.announce('New high score: 10');
    expect(getLiveRegion(announcer).textContent).toBe('New high score: 10');

    announcer.announce('New high score: 10');
    expect(getLiveRegion(announcer).textContent).toBe('New high score: 10');

    announcer.announce('New high score: 11');
    expect(getLiveRegion(announcer).textContent).toBe('New high score: 11');
  });
});
