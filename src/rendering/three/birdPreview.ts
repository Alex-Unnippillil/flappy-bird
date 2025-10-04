import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { loadBird } from '../../core/assets';

function getContainer(): HTMLElement {
  const container = document.getElementById('bird-preview');
  if (!container) {
    throw new Error('Missing #bird-preview container');
  }
  return container;
}

function createRenderer(container: HTMLElement): WebGLRenderer {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const resize = () => {
    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight, false);
  };
  resize();
  window.addEventListener('resize', resize);
  container.appendChild(renderer.domElement);
  return renderer;
}

function createScene(): { scene: Scene; camera: PerspectiveCamera } {
  const scene = new Scene();
  scene.background = new Color('#d6ecff');

  const camera = new PerspectiveCamera(35, 1, 0.05, 10);
  camera.position.set(0.65, 0.35, 1.2);
  camera.lookAt(new Vector3(0, 0.2, 0));

  const ambient = new AmbientLight(0xffffff, 0.8);
  const keyLight = new DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(1.4, 1.2, 0.8);
  const rimLight = new DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(-1.2, 0.6, -0.8);

  scene.add(ambient, keyLight, rimLight);

  return { scene, camera };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function showError(container: HTMLElement, error: unknown): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'preview-error';

  const heading = document.createElement('h2');
  heading.textContent = 'Unable to load bird preview';

  const instructions = document.createElement('p');
  instructions.textContent = 'Generate the procedural assets locally by running "python tools/generate_bird_assets.py" and refresh this page.';

  const details = document.createElement('p');
  details.textContent = toErrorMessage(error);

  wrapper.append(heading, instructions, details);
  container.appendChild(wrapper);
}

async function init(): Promise<void> {
  const container = getContainer();

  let bird = null;
  try {
    bird = await loadBird();
  } catch (error) {
    console.error('Failed to load bird preview', error);
    showError(container, error);
    return;
  }

  const renderer = createRenderer(container);
  const { scene, camera } = createScene();
  const clock = new Clock();

  const { root, mixer } = bird;
  scene.add(root);

  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) {
      mixer.update(delta);
    }
    root.rotation.y += delta * 0.2;
    renderer.render(scene, camera);
  };

  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void init();
  });
} else {
  void init();
}
