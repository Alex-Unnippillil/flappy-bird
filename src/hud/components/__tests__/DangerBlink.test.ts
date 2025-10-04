import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  DANGER_LEVEL_CLASSES,
  DANGER_LEVEL_INTENSITY,
  DangerBlink,
  HUD_DANGER_EVENT,
} from "../DangerBlink";

describe("DangerBlink", () => {
  let container: HTMLElement;
  let component: DangerBlink;
  let eventTarget: EventTarget;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    eventTarget = new EventTarget();
    component = new DangerBlink(container, { eventTarget });
  });

  afterEach(() => {
    component.destroy();
    container.remove();
  });

  it("initialises with the none level applied", () => {
    expect(container.classList.contains("danger-blink")).toBe(true);
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.none)).toBe(true);
    expect(component.level).toBe("none");
    expect(
      container.style.getPropertyValue("--danger-blink-intensity").trim()
    ).toBe(String(DANGER_LEVEL_INTENSITY.none));
  });

  it("updates classes and intensity when receiving string levels", () => {
    eventTarget.dispatchEvent(
      new CustomEvent(HUD_DANGER_EVENT, { detail: { level: "medium" } })
    );

    expect(component.level).toBe("medium");
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.none)).toBe(false);
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.medium)).toBe(true);
    expect(
      container.style.getPropertyValue("--danger-blink-intensity").trim()
    ).toBe(String(DANGER_LEVEL_INTENSITY.medium));

    eventTarget.dispatchEvent(
      new CustomEvent(HUD_DANGER_EVENT, { detail: { level: "critical" } })
    );

    expect(component.level).toBe("critical");
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.medium)).toBe(
      false
    );
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.critical)).toBe(
      true
    );
    expect(
      container.style.getPropertyValue("--danger-blink-intensity").trim()
    ).toBe(String(DANGER_LEVEL_INTENSITY.critical));
  });

  it("normalises numeric payloads to the appropriate level", () => {
    eventTarget.dispatchEvent(
      new CustomEvent(HUD_DANGER_EVENT, { detail: { level: 2 } })
    );

    expect(component.level).toBe("medium");
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.medium)).toBe(true);

    eventTarget.dispatchEvent(
      new CustomEvent(HUD_DANGER_EVENT, { detail: { level: 4 } })
    );

    expect(component.level).toBe("critical");
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.critical)).toBe(
      true
    );
  });

  it("ignores unsupported payloads", () => {
    eventTarget.dispatchEvent(
      new CustomEvent(HUD_DANGER_EVENT, { detail: { level: "bogus" } })
    );

    expect(component.level).toBe("none");
    expect(container.classList.contains(DANGER_LEVEL_CLASSES.none)).toBe(true);
  });
});
