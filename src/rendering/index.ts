import type { ColorRepresentation } from "three";
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";

import {
  createDefaultLights,
  type LightingOptions,
  type LightingResult,
} from "./three/lights";

export interface RendererSize {
  width: number;
  height: number;
}

export interface CameraOptions {
  fov?: number;
  near?: number;
  far?: number;
  position?: { x: number; y: number; z: number };
}

export interface RendererInitOptions {
  canvas?: HTMLCanvasElement;
  antialias?: boolean;
  size?: RendererSize;
  pixelRatio?: number;
  clearColor?: ColorRepresentation;
  lighting?: LightingOptions;
  camera?: CameraOptions;
}

export interface InitializedRenderer {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  lights: LightingResult;
}

function resolveSize(
  canvas: HTMLCanvasElement | undefined,
  size: RendererSize | undefined
): RendererSize {
  if (size) {
    return size;
  }

  if (canvas) {
    return { width: canvas.clientWidth, height: canvas.clientHeight };
  }

  if (typeof window !== "undefined") {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  return { width: 1, height: 1 };
}

export function initializeRenderer(
  options: RendererInitOptions = {}
): InitializedRenderer {
  const { canvas, antialias = true } = options;
  const size = resolveSize(canvas, options.size);
  const pixelRatio =
    options.pixelRatio ??
    (typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1);

  const renderer = new WebGLRenderer({
    canvas: canvas ?? undefined,
    antialias,
  });
  renderer.setSize(size.width, size.height, false);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  if (options.clearColor !== undefined) {
    scene.background = new Color(options.clearColor);
  }

  const cameraOptions = options.camera ?? {};
  const camera = new PerspectiveCamera(
    cameraOptions.fov ?? 60,
    size.width / size.height,
    cameraOptions.near ?? 0.1,
    cameraOptions.far ?? 1000
  );
  const cameraPosition = cameraOptions.position ?? { x: 0, y: 0, z: 10 };
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

  const enableShadows = options.lighting?.enableShadows ?? false;
  renderer.shadowMap.enabled = enableShadows;
  renderer.shadowMap.autoUpdate = enableShadows;

  const lights = createDefaultLights(scene, {
    ...options.lighting,
    enableShadows,
  });

  return { renderer, scene, camera, lights };
}
