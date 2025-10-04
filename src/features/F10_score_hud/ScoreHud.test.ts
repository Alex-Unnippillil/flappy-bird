import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  GAME_STATE_CHANGE_EVENT,
  PIPE_CLEARED_EVENT,
  ScoreHud,
} from "./ScoreHud";

const createContainer = () => {
  const container = document.createElement("div");
  container.className = "game-stage";
  container.style.position = "relative";
  document.body.appendChild(container);
  return container;
};

describe("ScoreHud", () => {
  let container: HTMLDivElement;
  let eventTarget: EventTarget;
  let hud: ScoreHud | null = null;

  beforeEach(() => {
    container = createContainer();
    eventTarget = new EventTarget();
    hud = new ScoreHud({ container, eventTarget });
  });

  afterEach(() => {
    hud?.destroy();
    container.remove();
  });

  it("increments the score when pipes are cleared", () => {
    eventTarget.dispatchEvent(new CustomEvent(PIPE_CLEARED_EVENT));
    eventTarget.dispatchEvent(
      new CustomEvent(PIPE_CLEARED_EVENT, { detail: { value: 2 } }),
    );

    expect(hud?.element.textContent).toBe("3");
    expect(hud?.element.dataset.score).toBe("3");
  });

  it("resets when the game returns to the ready state", () => {
    eventTarget.dispatchEvent(new CustomEvent(PIPE_CLEARED_EVENT));
    expect(hud?.element.textContent).toBe("1");

    eventTarget.dispatchEvent(
      new CustomEvent(GAME_STATE_CHANGE_EVENT, { detail: { state: "ready" } }),
    );

    expect(hud?.element.textContent).toBe("0");
  });
});
