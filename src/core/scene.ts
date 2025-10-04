import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";

const MAX_PIXEL_RATIO = 2;
const DEFAULT_BACKGROUND = "#87ceeb";
const DEFAULT_FOV = 50;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 100;

export interface SceneContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

function getContainer(): HTMLElement {
  const container = document.getElementById("app");
  if (!container) {
    throw new Error("Missing #app container for scene initialization");
  }
  return container;
}

function computePixelRatio(): number {
  if (typeof window === "undefined") {
    return 1;
  }
  const ratio = window.devicePixelRatio ?? 1;
  return Math.min(Math.max(ratio, 1), MAX_PIXEL_RATIO);
}

function updateRendererSize(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  container: HTMLElement
): void {
  const width = container.clientWidth || container.offsetWidth || window.innerWidth || 1;
  const height =
    container.clientHeight || container.offsetHeight || window.innerHeight || width || 1;

  if (height === 0) {
    return;
  }

  renderer.setSize(width, height, false);
  const aspect = width / height;
  if (camera.aspect !== aspect) {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }
}

export function createSceneContext(): SceneContext {
  const container = getContainer();

  const scene = new Scene();
  scene.background = new Color(DEFAULT_BACKGROUND);

  const camera = new PerspectiveCamera(DEFAULT_FOV, 1, NEAR_PLANE, FAR_PLANE);
  camera.position.set(0, 1.5, 6);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(computePixelRatio());
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";

  updateRendererSize(renderer, camera, container);
  window.addEventListener("resize", () => updateRendererSize(renderer, camera, container));

  container.appendChild(renderer.domElement);

  return { scene, camera, renderer };
}
