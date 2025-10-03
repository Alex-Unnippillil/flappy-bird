import {
  AmbientLight,
  Color,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';

import { Bird3D } from './entities/Bird3D';
import { Pipe3D } from './entities/Pipe3D';
import { DeterministicPRNG, createDeterministicPrng } from './systems/prng';
import { CONFIG } from './systems/state.js';

const FIXED_STEP = 1 / 60;
const MAX_ACCUMULATED_TIME = FIXED_STEP * 5;
const PIPE_INTERVAL_SECONDS = CONFIG.pipeInterval / 60;
const INITIAL_PIPE_SPEED = CONFIG.initialPipeSpeed * 60;
const PIPE_SPEED_INCREMENT = 0.5 * 60;
const DEFAULT_GAP_SIZE = CONFIG.gapSize;
const MAX_DELTA_SECONDS = 0.25;

const PARALLAX_CONFIG = [
  { color: 0xb2dfdb, speedMultiplier: 0.1, opacity: 0.7, depth: -40 },
  { color: 0x80cbc4, speedMultiplier: 0.2, opacity: 0.8, depth: -30 },
  { color: 0x4db6ac, speedMultiplier: 0.35, opacity: 0.9, depth: -20 },
] as const;

type GameState = 'loading' | 'ready' | 'running' | 'gameOver';

type RandomSource = DeterministicPRNG | (() => number);

interface GameLoopOptions {
  readonly canvas: HTMLCanvasElement;
  readonly prng?: RandomSource;
}

interface ParallaxLayerConfig {
  readonly color: number;
  readonly speedMultiplier: number;
  readonly opacity: number;
  readonly depth: number;
}

interface ParallaxLayer {
  readonly meshes: Mesh[];
  speedMultiplier: number;
  tileWidth: number;
}

interface ListenerMap {
  score: Set<(score: number) => void>;
  state: Set<(state: GameState) => void>;
}

function resolveRandom(random: RandomSource | undefined): DeterministicPRNG | { next(): number; reset?(): void } {
  if (!random) {
    return createDeterministicPrng();
  }

  if (typeof random === 'function') {
    return {
      next: random,
    };
  }

  return random;
}

function randomBetween(random: { next(): number }, min: number, max: number): number {
  const value = random.next();
  return MathUtils.lerp(min, max, MathUtils.clamp(value, 0, 1));
}

export class GameLoop {
  public readonly ready: Promise<void>;

  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: OrthographicCamera;
  private readonly canvas: HTMLCanvasElement;
  private readonly listeners: ListenerMap;
  private readonly prng: { next(): number; reset?(): void };
  private readonly parallaxLayers: ParallaxLayer[] = [];
  private readonly pipePool: Pipe3D[] = [];
  private readonly pipes: Pipe3D[] = [];
  private readonly handleResize: () => void;

  private bird: Bird3D | null = null;
  private state: GameState = 'loading';
  private animationFrameId: number | null = null;
  private accumulator = 0;
  private lastTimestamp = 0;
  private viewport = new Vector2(400, 400);
  private spawnX = 120;
  private pipeSpeed = INITIAL_PIPE_SPEED;
  private currentGapSize = DEFAULT_GAP_SIZE;
  private spawnTimer = PIPE_INTERVAL_SECONDS;
  private score = 0;

  constructor({ canvas, prng }: GameLoopOptions) {
    this.canvas = canvas;
    this.prng = resolveRandom(prng);
    this.listeners = {
      score: new Set(),
      state: new Set(),
    };

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
    this.renderer.autoClear = true;
    this.renderer.shadowMap.enabled = false;
    const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio ?? 1, 2) : 1;
    this.renderer.setPixelRatio(pixelRatio);

    this.scene = new Scene();
    this.scene.background = new Color(0x87ceeb);

    this.camera = new OrthographicCamera(0, this.viewport.x, this.viewport.y, 0, -1000, 1000);
    this.camera.position.set(0, 0, 200);
    this.camera.lookAt(0, 0, 0);

    this.handleResize = () => {
      this.updateViewportFromCanvas();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
    }

    this.ready = this.initialize();
  }

  public onScore(listener: (score: number) => void): () => void {
    this.listeners.score.add(listener);
    return () => {
      this.listeners.score.delete(listener);
    };
  }

  public onStateChange(listener: (state: GameState) => void): () => void {
    this.listeners.state.add(listener);
    return () => {
      this.listeners.state.delete(listener);
    };
  }

  public getScore(): number {
    return this.score;
  }

  public getState(): GameState {
    return this.state;
  }

  public start(): void {
    if (this.state === 'loading') {
      return;
    }

    if (this.state !== 'running') {
      this.state = 'running';
      this.emitState();
    }
  }

  public handlePrimaryAction(): void {
    if (!this.bird || this.state === 'loading') {
      return;
    }

    if (this.state === 'ready') {
      this.start();
      this.bird.flap();
      return;
    }

    if (this.state === 'gameOver') {
      this.start();
      this.bird.flap();
      return;
    }

    if (this.state === 'running') {
      this.bird.flap();
    }
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.renderer.dispose();

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  private async initialize(): Promise<void> {
    this.updateViewportFromCanvas();
    this.setupLights();
    this.setupParallaxLayers();
    this.updateViewportFromCanvas();

    this.bird = await Bird3D.create({
      initialPosition: { x: this.spawnX, y: this.viewport.y / 2 },
      maxY: this.viewport.y,
    });
    const radius = this.bird.getRadius();
    this.bird.setVerticalBounds(radius, this.viewport.y - radius);
    this.scene.add(this.bird.object);

    this.populatePipePool();
    this.resetRun();

    this.state = 'ready';
    this.emitState();

    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame((time) => this.tick(time));
  }

  private populatePipePool(): void {
    const poolSize = 6;
    for (let i = this.pipePool.length; i < poolSize; i += 1) {
      this.pipePool.push(new Pipe3D({ worldHeight: this.viewport.y, gapSize: this.currentGapSize }));
    }
  }

  private setupLights(): void {
    const ambient = new AmbientLight(0xffffff, 0.6);
    const directional = new DirectionalLight(0xffffff, 0.8);
    directional.position.set(0.5, 1, 1).multiplyScalar(500);
    directional.castShadow = false;

    this.scene.add(ambient, directional);
  }

  private setupParallaxLayers(): void {
    const geometry = new PlaneGeometry(1, 1);
    for (const config of PARALLAX_CONFIG as readonly ParallaxLayerConfig[]) {
      const material = new MeshBasicMaterial({ color: new Color(config.color), transparent: true, opacity: config.opacity });
      const meshes: Mesh[] = [];
      for (let i = 0; i < 2; i += 1) {
        const mesh = new Mesh(geometry, material);
        mesh.position.z = config.depth;
        mesh.scale.set(this.viewport.x, this.viewport.y, 1);
        mesh.position.set(this.viewport.x * (i + 0.5), this.viewport.y / 2, config.depth);
        mesh.matrixAutoUpdate = true;
        mesh.receiveShadow = false;
        meshes.push(mesh);
        this.scene.add(mesh);
      }

      this.parallaxLayers.push({ meshes, speedMultiplier: config.speedMultiplier, tileWidth: this.viewport.x });
    }
  }

  private emitScore(): void {
    for (const listener of this.listeners.score) {
      listener(this.score);
    }
  }

  private emitState(): void {
    for (const listener of this.listeners.state) {
      listener(this.state);
    }
  }

  private tick(timestamp: number): void {
    this.animationFrameId = requestAnimationFrame((time) => this.tick(time));

    const deltaSeconds = Math.min((timestamp - this.lastTimestamp) / 1000, MAX_DELTA_SECONDS);
    this.lastTimestamp = timestamp;

    this.accumulator = Math.min(this.accumulator + deltaSeconds, MAX_ACCUMULATED_TIME);

    while (this.accumulator >= FIXED_STEP) {
      this.updateSimulation(FIXED_STEP);
      this.accumulator -= FIXED_STEP;
    }

    this.render();
  }

  private updateSimulation(deltaSeconds: number): void {
    if (!this.bird) {
      return;
    }

    const isRunning = this.state === 'running';
    this.updateParallax(deltaSeconds, isRunning ? this.pipeSpeed : 0);

    this.bird.update(deltaSeconds, isRunning);

    if (!isRunning) {
      return;
    }

    const birdSphere = this.bird.getBoundingSphere();

    for (const pipe of this.pipes) {
      pipe.update(deltaSeconds, this.pipeSpeed);
      if (pipe.intersectsSphere(birdSphere)) {
        this.handleCollision();
        return;
      }
    }

    this.spawnTimer -= deltaSeconds;
    if (this.spawnTimer <= 0) {
      this.spawnPipe();
      this.spawnTimer += PIPE_INTERVAL_SECONDS;
    }

    this.checkScore(birdSphere.center.x);
    this.recycleOffscreenPipes();
    this.checkBounds(birdSphere);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private updateParallax(deltaSeconds: number, baseSpeed: number): void {
    for (const layer of this.parallaxLayers) {
      const movement = baseSpeed * layer.speedMultiplier * deltaSeconds;
      if (movement === 0) {
        continue;
      }

      for (const mesh of layer.meshes) {
        mesh.position.x -= movement;
        const wrapThreshold = -layer.tileWidth * 0.5;
        if (mesh.position.x <= wrapThreshold) {
          mesh.position.x += layer.tileWidth * layer.meshes.length;
        }
      }
    }
  }

  private spawnPipe(forcedX?: number): void {
    const pipe = this.pipePool.pop() ?? new Pipe3D({ worldHeight: this.viewport.y, gapSize: this.currentGapSize });
    pipe.setWorldHeight(this.viewport.y);
    pipe.setGapSize(this.currentGapSize);
    this.scene.add(pipe.group);

    const halfGap = this.currentGapSize * 0.5;
    const minCenter = halfGap + 24;
    const maxCenter = this.viewport.y - halfGap - 24;
    const gapCenter = randomBetween(this.prng, minCenter, maxCenter);
    const spawnOffset = this.pipeSpeed * PIPE_INTERVAL_SECONDS;
    const spawnX = forcedX ?? this.viewport.x + spawnOffset;
    pipe.reposition(spawnX, gapCenter, this.currentGapSize);
    this.pipes.push(pipe);
  }

  private recycleOffscreenPipes(): void {
    const leftBoundary = -120;
    for (let i = this.pipes.length - 1; i >= 0; i -= 1) {
      const pipe = this.pipes[i];
      if (pipe.isOffscreen(leftBoundary)) {
        this.scene.remove(pipe.group);
        this.pipePool.push(pipe);
        this.pipes.splice(i, 1);
      }
    }
  }

  private checkScore(birdX: number): void {
    for (const pipe of this.pipes) {
      if (pipe.tryScore(birdX)) {
        this.score += 1;
        this.emitScore();
        if (this.score > 0 && this.score % 100 === 0) {
          this.pipeSpeed += PIPE_SPEED_INCREMENT;
        }
      }
    }
  }

  private checkBounds(birdSphere: ReturnType<Bird3D['getBoundingSphere']>): void {
    const { center, radius } = birdSphere;
    if (center.y - radius <= 0 || center.y + radius >= this.viewport.y) {
      this.handleCollision();
    }
  }

  private handleCollision(): void {
    if (this.state !== 'running') {
      return;
    }

    this.state = 'gameOver';
    this.emitState();
    this.resetRun();
  }

  private resetRun(): void {
    this.pipeSpeed = INITIAL_PIPE_SPEED;
    this.currentGapSize = DEFAULT_GAP_SIZE;
    this.spawnTimer = PIPE_INTERVAL_SECONDS;
    this.score = 0;
    this.emitScore();

    if (typeof this.prng.reset === 'function') {
      this.prng.reset();
    }

    while (this.pipes.length > 0) {
      const pipe = this.pipes.pop();
      if (pipe) {
        this.scene.remove(pipe.group);
        this.pipePool.push(pipe);
      }
    }

    const firstSpawnX = this.viewport.x + this.pipeSpeed * 0.5;
    const secondSpawnX = firstSpawnX + this.pipeSpeed * PIPE_INTERVAL_SECONDS;
    this.spawnPipe(firstSpawnX);
    this.spawnPipe(secondSpawnX);

    if (this.bird) {
      this.bird.reset({ x: this.spawnX, y: this.viewport.y / 2 });
    }
  }

  private updateViewportFromCanvas(): void {
    const width = this.canvas.clientWidth || this.canvas.width;
    const height = this.canvas.clientHeight || this.canvas.height;
    this.viewport.set(width, height);
    this.spawnX = width * 0.25;

    this.renderer.setSize(width, height, false);

    this.camera.left = 0;
    this.camera.right = width;
    this.camera.top = height;
    this.camera.bottom = 0;
    this.camera.updateProjectionMatrix();

    for (const layer of this.parallaxLayers) {
      layer.tileWidth = width;
      layer.meshes.forEach((mesh, index) => {
        mesh.scale.set(width, height, 1);
        mesh.position.set(width * (index + 0.5), height / 2, mesh.position.z);
      });
    }

    for (const pipe of this.pipes) {
      pipe.setWorldHeight(height);
    }
    for (const pipe of this.pipePool) {
      pipe.setWorldHeight(height);
    }

    if (this.bird) {
      const radius = this.bird.getRadius();
      this.bird.setVerticalBounds(radius, height - radius);
      if (this.state === 'running') {
        const clampedY = MathUtils.clamp(this.bird.object.position.y, radius, height - radius);
        this.bird.object.position.x = this.spawnX;
        this.bird.object.position.y = clampedY;
        this.bird.refreshBounds();
      } else {
        this.bird.reset({ x: this.spawnX, y: height / 2 });
      }
    }
  }
}
