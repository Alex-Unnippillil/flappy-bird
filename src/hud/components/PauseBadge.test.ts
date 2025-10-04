import { describe, expect, it, beforeEach } from "vitest";
import { HUD_GAME_OVER, HUD_PAUSE } from "../events";
import { PauseBadge } from "./PauseBadge";

describe("PauseBadge", () => {
  beforeEach(() => {
    document.body.innerHTML = '<header class="hud-panel"></header>';
  });

  it("is hidden by default", () => {
    const badge = new PauseBadge();
    expect(badge.element.classList.contains("is-hidden")).toBe(true);
    expect(badge.element.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows when paused and hides when resumed", () => {
    const badge = new PauseBadge();

    window.dispatchEvent(new CustomEvent(HUD_PAUSE, { detail: { paused: true } }));
    expect(badge.element.classList.contains("is-hidden")).toBe(false);
    expect(badge.element.getAttribute("aria-hidden")).toBe("false");

    window.dispatchEvent(new CustomEvent(HUD_PAUSE, { detail: { paused: false } }));
    expect(badge.element.classList.contains("is-hidden")).toBe(true);
    expect(badge.element.getAttribute("aria-hidden")).toBe("true");
  });

  it("hides automatically when the game is over", () => {
    const badge = new PauseBadge();

    window.dispatchEvent(new CustomEvent(HUD_PAUSE, { detail: { paused: true } }));
    expect(badge.element.classList.contains("is-hidden")).toBe(false);

    window.dispatchEvent(new CustomEvent(HUD_PAUSE, { detail: { paused: true, gameOver: true } }));
    expect(badge.element.classList.contains("is-hidden")).toBe(true);

    window.dispatchEvent(new CustomEvent(HUD_PAUSE, { detail: { paused: true } }));
    expect(badge.element.classList.contains("is-hidden")).toBe(false);

    window.dispatchEvent(new CustomEvent(HUD_GAME_OVER));
    expect(badge.element.classList.contains("is-hidden")).toBe(true);
  });

  it("normalises alternative game over states", () => {
    const badge = new PauseBadge();

    window.dispatchEvent(
      new CustomEvent(HUD_PAUSE, { detail: { paused: true, state: "game-over" } })
    );
    expect(badge.element.classList.contains("is-hidden")).toBe(true);

    window.dispatchEvent(
      new CustomEvent(HUD_PAUSE, { detail: { paused: true, state: "running" } })
    );
    expect(badge.element.classList.contains("is-hidden")).toBe(false);
  });
});
