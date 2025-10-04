import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ComboToast, HUD_COMBO } from "./ComboToast";

describe("ComboToast", () => {
  let comboToast: ComboToast;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
    comboToast = new ComboToast();
  });

  afterEach(() => {
    comboToast.destroy();
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("removes toast nodes after the animation completes", () => {
    const detail = { streak: 4, bonus: 150 };
    window.dispatchEvent(new CustomEvent(HUD_COMBO, { detail }));

    const toast = document.querySelector<HTMLElement>(".combo-toast");
    expect(toast).not.toBeNull();

    toast?.dispatchEvent(new Event("animationend"));

    expect(document.querySelector(".combo-toast")).toBeNull();
  });
});
