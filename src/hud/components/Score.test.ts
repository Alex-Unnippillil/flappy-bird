import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { Score, teardownScore } from "./Score";
import { emitScoreEvent, resetHudEventBus } from "../events";
import { formatScore } from "../utils/formatScore";

describe("Score HUD component", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
  });

  afterEach(() => {
    resetHudEventBus();
  });

  it("renders the initial score", () => {
    const controller = Score.mount(container);
    expect(container.textContent).toBe(formatScore(0));
    teardownScore(controller);
  });

  it("updates when a score event is emitted", () => {
    const controller = Score.mount(container);

    emitScoreEvent(42);

    expect(container.textContent).toBe(formatScore(42));
    teardownScore(controller);
  });

  it("stops reacting after teardown", () => {
    const controller = Score.mount(container);

    teardownScore(controller);
    emitScoreEvent(15);

    // The container is empty once destroyed; ensure the score is not re-added.
    expect(container.textContent).toBe("");
  });
});
