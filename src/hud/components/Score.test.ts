import { describe, expect, it, vi } from 'vitest';
import {
  SCORE_POP_CLASS,
  Score,
  dispatchScoreEvent,
} from './Score';

describe('HUD Score component', () => {
  it('toggles the pop class for each score event while updating the text', () => {
    vi.useFakeTimers();

    const element = document.createElement('span');
    const score = new Score({
      element,
      throttleMs: 100,
      popDurationMs: 60,
    });

    try {
      dispatchScoreEvent(element, 1);
      expect(element.textContent).toBe('1');
      expect(element.classList.contains(SCORE_POP_CLASS)).toBe(true);

      dispatchScoreEvent(element, 2);
      dispatchScoreEvent(element, 3);
      expect(element.textContent).toBe('3');

      // First animation completes and removes the class
      vi.advanceTimersByTime(60);
      expect(element.classList.contains(SCORE_POP_CLASS)).toBe(false);

      // After the throttle window the queued event animates again
      vi.advanceTimersByTime(40);
      expect(element.classList.contains(SCORE_POP_CLASS)).toBe(true);

      // Second animation completes and removes the class again
      vi.advanceTimersByTime(60);
      expect(element.classList.contains(SCORE_POP_CLASS)).toBe(false);

      // Final queued event should animate after another throttle window
      vi.advanceTimersByTime(40);
      expect(element.classList.contains(SCORE_POP_CLASS)).toBe(true);

      vi.advanceTimersByTime(60);
      expect(element.classList.contains(SCORE_POP_CLASS)).toBe(false);
    } finally {
      score.dispose();
      vi.useRealTimers();
    }
  });
});
