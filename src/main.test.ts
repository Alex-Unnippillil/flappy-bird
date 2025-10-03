import { beforeEach, describe, expect, it, vi } from "vitest";

describe("bootstrapGame", () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it("displays the fallback message and initialises the 2D renderer when WebGL is unavailable", async () => {
    const canvas = document.createElement("canvas");
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    const context = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(context);
    window.requestAnimationFrame = vi.fn().mockReturnValue(1);
    window.cancelAnimationFrame = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { bootstrapGame } = await import("./main");

    bootstrapGame({ detectWebGL: () => false });

    const message = document.getElementById("webgl-fallback-message");
    expect(message).not.toBeNull();
    expect(message?.textContent).toContain("Loading the classic 2D renderer");
    expect(canvas.dataset.renderer).toBe("2d");

    consoleErrorSpy.mockRestore();
  });
});
