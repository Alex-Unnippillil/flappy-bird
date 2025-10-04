import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountHudRoot } from "../hud";

describe("mountHudRoot", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
    delete (process.env as Record<string, string | undefined>).VITE_FF_F07;
  });

  it("creates the HUD root inside the game stage when available", () => {
    const stage = document.createElement("div");
    stage.className = "game-stage";
    document.body.appendChild(stage);

    const root = mountHudRoot();

    expect(root.id).toBe("hud-root");
    expect(root.parentElement).toBe(stage);
    expect(root.getAttribute("role")).toBe("presentation");
  });

  it("reuses an existing HUD root element", () => {
    const stage = document.createElement("div");
    stage.className = "game-stage";
    const preExisting = document.createElement("div");
    preExisting.id = "hud-root";
    stage.appendChild(preExisting);
    document.body.appendChild(stage);

    const root = mountHudRoot();

    expect(root).toBe(preExisting);
    expect(root.style.transform).toBe("translate3d(0, 0, 0)");
    expect(root.style.willChange).toBe("transform");
    expect(root.style.isolation).toBe("isolate");
  });

  it("loads HUD CSS when the performance flag is enabled", () => {
    process.env.VITE_FF_F07 = "true";

    mountHudRoot();

    const styleLink = document.head.querySelector(
      'link[data-hud-root-styles="true"]',
    );
    expect(styleLink).toBeInstanceOf(HTMLLinkElement);
    expect((styleLink as HTMLLinkElement).href).toContain("hud.css");
  });

  it("avoids re-measuring siblings when frequently updating scores", () => {
    const stage = document.createElement("div");
    stage.className = "game-stage";
    const unrelated = document.createElement("div");
    const reflowSpy = vi.fn();
    unrelated.getBoundingClientRect = reflowSpy;
    stage.appendChild(unrelated);
    document.body.appendChild(stage);

    const root = mountHudRoot();
    const score = document.createElement("span");
    root.appendChild(score);

    for (let i = 0; i < 20; i += 1) {
      score.textContent = `${i}`;
    }

    expect(reflowSpy).not.toHaveBeenCalled();
  });
});
