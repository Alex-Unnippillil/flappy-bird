import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createShareButton,
  formatShareSession,
  type ShareSessionDetails,
} from "../ShareButton";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("formatShareSession", () => {
  it("includes optional stats when provided", () => {
    const details: ShareSessionDetails = {
      score: 42,
      bestScore: 55,
      speedMultiplier: 1.75,
      durationSeconds: 125,
      powerUpsCollected: 3,
      timestamp: new Date("2024-06-01T12:34:56Z"),
      url: "https://example.com/play",
    };

    const result = formatShareSession(details);

    expect(result).toContain("I just scored 42 in Flappy Bird!");
    expect(result).toContain("Personal best: 55");
    expect(result).toContain("Top speed multiplier: 1.75x");
    expect(result).toContain("Run duration: 2m 5s");
    expect(result).toContain("Power-ups collected: 3");
    expect(result).toContain("Play now: https://example.com/play");
    expect(result).toContain("#FlappyBird #WebGames");
  });
});

describe("createShareButton", () => {
  const baseSession = (): ShareSessionDetails => ({
    score: 12,
    bestScore: 20,
    speedLabel: "Turbo",
    url: "https://example.com",
  });

  it("uses the Clipboard API when available", async () => {
    const button = document.createElement("button");
    button.textContent = "Share";
    document.body.appendChild(button);

    const writeText = vi.fn().mockResolvedValue(undefined);
    const onFeedback = vi.fn();

    const controller = createShareButton({
      target: button,
      session: baseSession,
      navigator: { clipboard: { writeText } } as unknown as Navigator,
      onFeedback,
    });

    const result = await controller.share();

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("I just scored 12 in Flappy Bird!");
    expect(onFeedback).toHaveBeenCalledWith({
      type: "success",
      message: "Session summary copied to clipboard!",
    });

    controller.dispose();
  });

  it("falls back to document.execCommand when the Clipboard API rejects", async () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    const execCommand = vi.fn().mockReturnValue(true);
    const onFeedback = vi.fn();

    const originalExecCommand = (document as Document & {
      execCommand?: (command: string) => boolean;
    }).execCommand;
    (document as Document & { execCommand?: (command: string) => boolean }).execCommand = execCommand;

    const controller = createShareButton({
      target: button,
      session: baseSession,
      navigator: { clipboard: { writeText } } as unknown as Navigator,
      onFeedback,
      document,
    });

    const result = await controller.share();

    expect(writeText).toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result).toBe(true);
    expect(onFeedback).toHaveBeenCalledWith({
      type: "success",
      message: "Session summary copied to clipboard!",
    });

    controller.dispose();

    (document as Document & { execCommand?: (command: string) => boolean }).execCommand = originalExecCommand;
  });

  it("reports an error when copy fails", async () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    const writeText = vi.fn().mockRejectedValue(new Error("Clipboard unavailable"));
    const onFeedback = vi.fn();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const controller = createShareButton({
      target: button,
      session: baseSession,
      navigator: { clipboard: { writeText } } as unknown as Navigator,
      onFeedback,
    });

    const result = await controller.share();

    expect(result).toBe(false);
    expect(writeText).toHaveBeenCalled();
    expect(onFeedback).toHaveBeenCalledWith({
      type: "error",
      message: "Unable to copy session summary. Please try again.",
    });
    expect(warnSpy).toHaveBeenCalled();

    controller.dispose();
  });
});
