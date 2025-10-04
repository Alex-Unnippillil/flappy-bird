import { describe, expect, it } from "vitest";
import { PauseMenu, PauseMenuEvent } from "./PauseMenu";

describe("PauseMenu", () => {
  const dispatchTab = (target: HTMLElement, options: { shiftKey?: boolean } = {}) => {
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      code: "Tab",
      bubbles: true,
      cancelable: true,
      shiftKey: options.shiftKey ?? false,
    });
    const origin =
      document.activeElement instanceof HTMLElement ? document.activeElement : target;
    origin.dispatchEvent(event);
  };

  it("traps focus within its buttons when tabbing forward and backward", () => {
    const menu = new PauseMenu();
    document.body.append(menu.element);

    menu.open();

    const resumeButton = menu.element.querySelector(
      '[data-pause-menu-button="resume"]'
    ) as HTMLButtonElement | null;
    const muteButton = menu.element.querySelector(
      '[data-pause-menu-button="mute"]'
    ) as HTMLButtonElement | null;
    const quitButton = menu.element.querySelector(
      '[data-pause-menu-button="quit"]'
    ) as HTMLButtonElement | null;

    expect(document.activeElement).toBe(resumeButton);

    dispatchTab(menu.element);
    expect(document.activeElement).toBe(muteButton);

    dispatchTab(menu.element);
    expect(document.activeElement).toBe(quitButton);

    dispatchTab(menu.element);
    expect(document.activeElement).toBe(resumeButton);

    dispatchTab(menu.element, { shiftKey: true });
    expect(document.activeElement).toBe(quitButton);
  });

  it("publishes events for button actions", () => {
    const events: string[] = [];
    const menu = new PauseMenu();
    document.body.append(menu.element);

    menu.addEventListener(PauseMenuEvent.Resume, () => events.push("resume"));
    menu.addEventListener(PauseMenuEvent.ToggleMute, (event) => {
      events.push(event.detail?.muted ? "muted" : "unmuted");
    });
    menu.addEventListener(PauseMenuEvent.Quit, () => events.push("quit"));

    menu.open();

    const resumeButton = menu.element.querySelector(
      '[data-pause-menu-button="resume"]'
    ) as HTMLButtonElement | null;
    const muteButton = menu.element.querySelector(
      '[data-pause-menu-button="mute"]'
    ) as HTMLButtonElement | null;
    const quitButton = menu.element.querySelector(
      '[data-pause-menu-button="quit"]'
    ) as HTMLButtonElement | null;

    resumeButton?.click();
    muteButton?.click();
    muteButton?.click();
    quitButton?.click();

    expect(events).toEqual(["resume", "muted", "unmuted", "quit"]);
  });
});
