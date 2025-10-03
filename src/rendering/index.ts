import {
  BoxGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";

import { createThreeApp, type ThreeApp, type UnifiedInputEvent } from "./threeApp";

export type {
  FixedUpdateCallback,
  FrameUpdateCallback,
  ThreeApp,
  UnifiedInputEvent,
} from "./threeApp";

export type InitializedThreeApp = ThreeApp;

export function initializeThreeRenderer(canvas: HTMLCanvasElement): InitializedThreeApp {
  const app = createThreeApp(canvas);

  const birdMaterial = new MeshStandardMaterial({
    color: 0xffd54f,
    roughness: 0.45,
    metalness: 0.05,
  });
  const bird = new Mesh(new BoxGeometry(0.6, 0.45, 0.5), birdMaterial);
  bird.castShadow = true;
  bird.position.set(0, 1.2, 0);
  app.scene.add(bird);

  const beak = new Mesh(
    new BoxGeometry(0.22, 0.12, 0.12),
    new MeshStandardMaterial({ color: 0xff8f00, roughness: 0.4, metalness: 0.1 })
  );
  beak.position.set(0.46, -0.02, 0);
  bird.add(beak);

  const ground = new Mesh(
    new PlaneGeometry(25, 25),
    new MeshStandardMaterial({ color: 0x4caf50, roughness: 1, metalness: 0 })
  );
  ground.receiveShadow = true;
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  app.scene.add(ground);

  const baseBirdY = bird.position.y;
  const bobFrequency = 0.8;
  const bobAmplitude = 0.14;
  let bobTimer = 0;
  let inputActive = false;
  let lastReducedMotion = app.isReducedMotion();

  const removeFixedUpdate = app.addFixedUpdateListener((fixedDelta) => {
    if (!app.isReducedMotion()) {
      bobTimer += fixedDelta;
    } else {
      bobTimer = 0;
    }

    const targetTilt = inputActive ? -0.5 : 0.25;
    bird.rotation.z = MathUtils.lerp(
      bird.rotation.z,
      targetTilt,
      Math.min(1, fixedDelta * 8)
    );
  });

  const removeFrameUpdate = app.addFrameListener((delta) => {
    const reduced = app.isReducedMotion();
    if (reduced) {
      bird.position.y = MathUtils.lerp(bird.position.y, baseBirdY, Math.min(1, delta * 6));
      bird.rotation.z = MathUtils.lerp(bird.rotation.z, 0, Math.min(1, delta * 6));
      lastReducedMotion = true;
      return;
    }

    if (lastReducedMotion) {
      bird.position.y = baseBirdY;
      lastReducedMotion = false;
    }

    const cycle = Math.sin(bobTimer * Math.PI * 2 * bobFrequency);
    bird.position.y = baseBirdY + cycle * bobAmplitude;
  });

  const removeInputListener = app.addInputListener((event: UnifiedInputEvent) => {
    if (event.type !== "primary") {
      return;
    }

    inputActive = event.phase === "start";
  });

  app.start();

  const originalDispose = app.dispose;

  return {
    ...app,
    dispose: () => {
      removeFixedUpdate();
      removeFrameUpdate();
      removeInputListener();
      originalDispose();
    },
  };
}
