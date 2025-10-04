import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { AriaAnnouncer } from "./AriaAnnouncer";

describe("AriaAnnouncer", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a polite live region", () => {
    const announcer = new AriaAnnouncer();
    expect(announcer.element.getAttribute("aria-live")).toBe("polite");
    expect(announcer.element.getAttribute("role")).toBe("status");
    expect(announcer.element.getAttribute("aria-atomic")).toBe("true");
  });

  it("debounces announcements to once per second", () => {
    const announcer = new AriaAnnouncer();

    announcer.announceScore(1);
    expect(announcer.element.textContent).toBe("");

    vi.advanceTimersByTime(999);
    expect(announcer.element.textContent).toBe("");

    vi.advanceTimersByTime(1);
    expect(announcer.element.textContent).toBe("Score 1");

    announcer.announceScore(2);
    vi.advanceTimersByTime(500);

    announcer.announceScore(3);
    expect(announcer.element.textContent).toBe("Score 1");

    vi.advanceTimersByTime(500);
    expect(announcer.element.textContent).toBe("Score 3");
  });

  it("deduplicates identical score updates", () => {
    const announcer = new AriaAnnouncer();

    announcer.announceScore(10);
    vi.advanceTimersByTime(1000);
    expect(announcer.element.textContent).toBe("Score 10");

    announcer.announceScore(10);
    vi.advanceTimersByTime(1000);
    expect(announcer.element.textContent).toBe("Score 10");

    announcer.announceScore(11);
    announcer.announceScore(11);
    vi.advanceTimersByTime(1000);
    expect(announcer.element.textContent).toBe("Score 11");
  });
});
