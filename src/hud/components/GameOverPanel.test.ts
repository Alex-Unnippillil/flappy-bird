import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HUD_GAME_OVER, HUD_RUNNING } from '../constants';
import { GameOverPanel } from './GameOverPanel';

describe('GameOverPanel', () => {
  let root: HTMLElement;
  let title: HTMLElement;
  let finalScore: HTMLElement;
  let bestScore: HTMLElement;
  let medalShelf: HTMLElement;
  let buttons: HTMLElement;
  let playAgain: HTMLButtonElement;
  let quitButton: HTMLButtonElement;
  let outsideButton: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="hudRoot" class="is-hidden" aria-hidden="true"></div>
      <h2 id="gameOverTitle">Game Over</h2>
      <output id="finalScore">0</output>
      <output id="bestScore">0</output>
      <div id="medalShelf"></div>
      <div id="actionButtons">
        <button id="playAgain" type="button">Play again</button>
        <button id="quitButton" type="button">Quit</button>
      </div>
      <button id="outsideFocus" type="button">Outside</button>
    `;

    root = document.getElementById('hudRoot') as HTMLElement;
    title = document.getElementById('gameOverTitle') as HTMLElement;
    finalScore = document.getElementById('finalScore') as HTMLElement;
    bestScore = document.getElementById('bestScore') as HTMLElement;
    medalShelf = document.getElementById('medalShelf') as HTMLElement;
    buttons = document.getElementById('actionButtons') as HTMLElement;
    playAgain = document.getElementById('playAgain') as HTMLButtonElement;
    quitButton = document.getElementById('quitButton') as HTMLButtonElement;
    outsideButton = document.getElementById('outsideFocus') as HTMLButtonElement;
  });

  function createPanel(onDismiss?: () => void) {
    return new GameOverPanel(
      {
        root,
        title,
        finalScore,
        bestScore,
        medalShelf,
        buttons,
      },
      { onDismiss }
    );
  }

  it('portals subcomponents into the HUD root when HUD_GAME_OVER is active', () => {
    const panel = createPanel();
    panel.sync(HUD_GAME_OVER, { score: 42, best: 128, medal: 'gold' });

    expect(root.contains(title)).toBe(true);
    expect(root.contains(finalScore)).toBe(true);
    expect(root.contains(bestScore)).toBe(true);
    expect(root.contains(medalShelf)).toBe(true);
    expect(root.contains(buttons)).toBe(true);

    expect(finalScore.textContent).toBe('42');
    expect(bestScore.textContent).toBe('128');
    expect(medalShelf.getAttribute('data-medal')).toBe('gold');
    expect(root.classList.contains('is-hidden')).toBe(false);
    expect(root.getAttribute('aria-hidden')).toBeNull();
  });

  it('restores subcomponents when the panel is dismissed via a new HUD state', () => {
    const panel = createPanel();
    panel.sync(HUD_GAME_OVER, { score: 5, best: 10 });

    expect(root.contains(title)).toBe(true);

    panel.sync(HUD_RUNNING);

    expect(root.contains(title)).toBe(false);
    expect(document.body.contains(title)).toBe(true);
    expect(document.body.contains(finalScore)).toBe(true);
    expect(document.body.contains(bestScore)).toBe(true);
    expect(document.body.contains(medalShelf)).toBe(true);
    expect(document.body.contains(buttons)).toBe(true);
    expect(root.classList.contains('is-hidden')).toBe(true);
    expect(root.getAttribute('aria-hidden')).toBe('true');
  });

  it('invokes the dismiss callback when Escape is pressed and restores focus', () => {
    const onDismiss = vi.fn();
    const panel = createPanel(onDismiss);

    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    panel.sync(HUD_GAME_OVER, { score: 17, best: 30 });
    expect(document.activeElement).toBe(playAgain);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    document.dispatchEvent(escapeEvent);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(outsideButton);
    expect(root.contains(title)).toBe(false);
  });

  it('traps focus within the panel when Tab or Shift+Tab are pressed', () => {
    const panel = createPanel();
    panel.sync(HUD_GAME_OVER, { score: 1, best: 2 });

    expect(document.activeElement).toBe(playAgain);

    playAgain.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    );
    expect(document.activeElement).toBe(quitButton);

    quitButton.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    );
    expect(document.activeElement).toBe(playAgain);

    playAgain.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, shiftKey: true })
    );
    expect(document.activeElement).toBe(quitButton);
  });
});
