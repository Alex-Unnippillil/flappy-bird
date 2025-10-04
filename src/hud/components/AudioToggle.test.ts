import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAudioToggle } from "./AudioToggle";
import {
  HUD_EVENT_AUDIO_TOGGLED,
  type HudAudioToggleDetail,
} from "../events";
import {
  getHudPreference,
  resetHudPreferences,
  setHudPreference,
} from "../hud-store";

declare global {
  interface DocumentEventMap {
    [HUD_EVENT_AUDIO_TOGGLED]: CustomEvent<HudAudioToggleDetail>;
  }
}

describe("AudioToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    resetHudPreferences();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("persists the toggled state via the HUD store", () => {
    const control = createAudioToggle();
    document.body.append(control.element);

    expect(getHudPreference("audioEnabled")).toBe(true);

    control.element.click();

    expect(getHudPreference("audioEnabled")).toBe(false);

    const stored = localStorage.getItem("flappy-hud-preferences");
    expect(stored).toContain("audioEnabled");
    expect(stored).toContain("false");
  });

  it("emits HUD audio toggle events with the latest state", () => {
    setHudPreference("audioEnabled", false);
    const target = new EventTarget();
    const factory = vi.fn(() => ({}) as AudioContext);
    const control = createAudioToggle({
      eventTarget: target,
      audioContextFactory: factory,
    });

    const handler = vi.fn();
    target.addEventListener(HUD_EVENT_AUDIO_TOGGLED, (event) => {
      handler((event as CustomEvent<HudAudioToggleDetail>).detail);
    });

    expect(factory).not.toHaveBeenCalled();

    control.element.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenLastCalledWith({
      enabled: true,
      audioContext: expect.any(Object),
    });
    expect(factory).toHaveBeenCalledTimes(1);

    control.element.click();
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenLastCalledWith({
      enabled: false,
      audioContext: null,
    });
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
