import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

export interface ThreeRendererContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  render: () => void;
  dispose: () => void;
}

const DEFAULT_CLEAR_COLOR = 0x87ceeb;

export function createThreeRenderer(container: HTMLElement): ThreeRendererContext {
  const scene = new Scene();
  scene.background = new Color(DEFAULT_CLEAR_COLOR);

  const camera = new PerspectiveCamera(
    60,
    Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = true;

  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === "static") {
    container.style.position = "relative";
  }

  const domElement = renderer.domElement;
  domElement.style.position = "absolute";
  domElement.style.top = "0";
  domElement.style.left = "0";
  domElement.style.width = "100%";
  domElement.style.height = "100%";
  domElement.style.pointerEvents = "none";
  domElement.style.display = "block";
  domElement.style.zIndex = "0";

  const resize = () => {
    const { width: rectWidth, height: rectHeight } = container.getBoundingClientRect();
    const width = Math.max(rectWidth, 1);
    const height = Math.max(rectHeight, 1);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  resize();
  window.addEventListener("resize", resize);

  container.appendChild(renderer.domElement);

  const render = () => {
    renderer.render(scene, camera);
  };

  const dispose = () => {
    window.removeEventListener("resize", resize);
    renderer.dispose();
  };

  return {
    scene,
    camera,
    renderer,
    render,
    dispose,
  };
}
