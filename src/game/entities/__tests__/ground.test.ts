import { describe, expect, it } from "vitest";
import { Ground } from "../ground";

describe("Ground", () => {
  it("covers the canvas width without seams", () => {
    const width = 320;
    const height = 200;
    const ground = new Ground(width, height, {
      tileWidth: 64,
      height: 40,
      initialScrollSpeed: 4,
    });

    const segments = ground.getSegments();
    expect(segments[0].x).toBeLessThanOrEqual(0);
    const lastSegment = segments[segments.length - 1];
    expect(lastSegment.x + lastSegment.width).toBeGreaterThanOrEqual(width);
  });

  it("keeps coverage intact after multiple updates", () => {
    const width = 480;
    const height = 240;
    const ground = new Ground(width, height, {
      tileWidth: 96,
      height: 48,
      initialScrollSpeed: 5,
    });

    for (let i = 0; i < 50; i += 1) {
      ground.update();
    }

    const segments = ground.getSegments();
    expect(segments[0].x).toBeLessThanOrEqual(0);
    const lastSegment = segments[segments.length - 1];
    expect(lastSegment.x + lastSegment.width).toBeGreaterThanOrEqual(width);
  });

  it("allows the scroll speed to be updated", () => {
    const ground = new Ground(200, 200, { tileWidth: 50, height: 30, initialScrollSpeed: 2 });

    ground.setScrollSpeed(6);
    ground.update();
    const afterSpeedChange = ground.getSegments()[0].x;

    ground.reset(3);
    ground.update();
    const afterReset = ground.getSegments()[0].x;

    expect(afterSpeedChange).not.toBe(afterReset);
    expect(ground.getScrollSpeed()).toBe(3);
  });
});
