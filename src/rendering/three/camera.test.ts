import { describe, expect, it } from "vitest";
import { Vector3 } from "three";

import {
  createSideScrollerCamera,
  getDynamicFov,
  updateSideScrollerCamera,
} from "./camera";

describe("getDynamicFov", () => {
  it("widens the FOV on tall viewports and narrows it on wide ones", () => {
    const referenceViewport = { width: 1600, height: 900 };
    const tallViewport = { width: 900, height: 1600 };
    const wideViewport = { width: 2560, height: 1080 };

    const referenceFov = getDynamicFov(referenceViewport);
    const tallFov = getDynamicFov(tallViewport);
    const wideFov = getDynamicFov(wideViewport);

    expect(tallFov).toBeGreaterThan(referenceFov);
    expect(wideFov).toBeLessThan(referenceFov);
    expect(tallFov).toBeLessThanOrEqual(75);
    expect(wideFov).toBeGreaterThanOrEqual(35);
  });
});

describe("updateSideScrollerCamera", () => {
  it("keeps the bird and next pipe framed while smoothing movement", () => {
    const viewport = { width: 1600, height: 900 };
    const camera = createSideScrollerCamera(viewport);
    const birdPosition = new Vector3(10, 5, 0);
    const nextPipePosition = new Vector3(18, 7, 0);

    updateSideScrollerCamera(
      camera,
      { position: birdPosition, radius: 0.6 },
      { viewport, smoothing: 1 },
      { position: nextPipePosition, gapHeight: 6 }
    );

    const focusPoint = camera.userData.focusPoint as Vector3;
    const positionTarget = camera.userData.positionTarget as Vector3;

    expect(focusPoint.x).toBeGreaterThan(birdPosition.x);
    expect(focusPoint.x).toBeLessThan(nextPipePosition.x);
    expect(focusPoint.y).toBeGreaterThan(birdPosition.y);
    expect(camera.position.x).toBeLessThan(focusPoint.x);
    expect(camera.position.z).toBeGreaterThanOrEqual(30);
    expect(positionTarget.distanceTo(camera.position)).toBeLessThan(1e-6);

    const tallViewport = { width: 900, height: 1600 };
    const previousFov = camera.fov;

    updateSideScrollerCamera(
      camera,
      { position: birdPosition, radius: 0.6 },
      { viewport: tallViewport, smoothing: 1 },
      { position: nextPipePosition, gapHeight: 6 }
    );

    expect(camera.fov).toBeGreaterThan(previousFov);
    const updatedFocus = camera.userData.focusPoint as Vector3;
    expect(updatedFocus.y).toBeCloseTo(focusPoint.y, 6);
  });
});
