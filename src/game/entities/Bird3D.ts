import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Group,
  LoopOnce,
  LoopRepeat,
  MathUtils,
  Object3D,
  Quaternion,
  Sphere,
  Vector3,
} from 'three';

import { loadCoreModel } from '../../rendering/three/assets';

const DEFAULT_BIRD_OPTIONS = Object.freeze({
  gravity: -36,
  flapImpulse: 420,
  maxUpwardVelocity: 360,
  maxDownwardVelocity: 520,
  minY: 0,
  maxY: 400,
});

const TILT_AXIS = new Vector3(0, 0, 1);
const TARGET_TILT = new Quaternion();

function findClipByName(animations: AnimationClip[], pattern: RegExp): AnimationClip | undefined {
  return animations.find((clip) => pattern.test(clip.name));
}

function extractAnimations(object: Group): AnimationClip[] {
  const candidate = object as Group & { animations?: AnimationClip[]; userData?: Record<string, unknown> };
  if (Array.isArray(candidate.animations) && candidate.animations.length > 0) {
    return candidate.animations;
  }

  const userData = candidate.userData ?? {};
  if (Array.isArray((userData as { animations?: unknown }).animations)) {
    return (userData as { animations: AnimationClip[] }).animations;
  }

  const gltfAnimations = (userData as { gltfAnimations?: unknown }).gltfAnimations;
  if (Array.isArray(gltfAnimations)) {
    return gltfAnimations as AnimationClip[];
  }

  return [];
}

export interface Bird3DOptions {
  readonly gravity?: number;
  readonly flapImpulse?: number;
  readonly maxUpwardVelocity?: number;
  readonly maxDownwardVelocity?: number;
  readonly minY?: number;
  readonly maxY?: number;
  readonly initialPosition?: Vector3 | { x: number; y: number; z?: number };
}

export class Bird3D {
  public readonly object: Group;

  private readonly mixer: AnimationMixer;
  private readonly animations: AnimationClip[];
  private options: Required<Bird3DOptions>;
  private readonly boundingSphere: Sphere;

  private currentAction: AnimationAction | null = null;
  private idleAction: AnimationAction | null = null;
  private flapAction: AnimationAction | null = null;
  private velocityY = 0;

  private constructor(object: Group, options: Required<Bird3DOptions>) {
    this.object = object;
    this.options = options;
    this.mixer = new AnimationMixer(object);
    this.animations = extractAnimations(object);

    this.setupAnimations();

    const boundingBox = new Box3().setFromObject(object);
    if (!boundingBox.isEmpty()) {
      this.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
    } else {
      // Provide a conservative default in case the model did not ship with geometry bounds.
      this.boundingSphere = new Sphere(new Vector3(), 12);
    }

    if (options.initialPosition) {
      const { x, y, z = 0 } = options.initialPosition;
      this.object.position.set(x, y, z);
    }
  }

  public static async create(options: Bird3DOptions = {}): Promise<Bird3D> {
    const merged = { ...DEFAULT_BIRD_OPTIONS, ...options } as Required<Bird3DOptions>;
    const object = await loadCoreModel.bird();
    object.traverse((node: Object3D) => {
      node.castShadow = true;
    });

    return new Bird3D(object, merged);
  }

  private setupAnimations(): void {
    if (this.animations.length === 0) {
      return;
    }

    this.idleAction = this.createAction(
      findClipByName(this.animations, /idle|hover/i) ?? this.animations[0],
      true,
    );

    const flapClip = findClipByName(this.animations, /flap|fly|wing/i);
    if (flapClip) {
      this.flapAction = this.createAction(flapClip, false);
    }

    this.playAction(this.idleAction, 0);
  }

  private createAction(clip: AnimationClip, loop: boolean): AnimationAction {
    const action = this.mixer.clipAction(clip);
    action.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
    action.enabled = true;
    action.clampWhenFinished = true;
    return action;
  }

  private playAction(target: AnimationAction | null, fadeDuration = 0.15): void {
    if (!target) {
      return;
    }

    if (this.currentAction === target) {
      return;
    }

    target.reset();
    target.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(target, fadeDuration, false);
    }

    this.currentAction = target;
  }

  private blendToIdle(): void {
    if (this.idleAction) {
      this.playAction(this.idleAction);
    }
  }

  private triggerFlapAnimation(): void {
    if (this.flapAction) {
      this.playAction(this.flapAction, 0.05);
      if (this.idleAction) {
        this.flapAction?.crossFadeTo(this.idleAction, 0.2, false);
      }
    }
  }

  public reset(position: Vector3 | { x: number; y: number; z?: number }): void {
    const { x, y, z = this.object.position.z } = position instanceof Vector3 ? position : position;
    this.object.position.set(x, y, z);
    this.velocityY = 0;
    this.boundingSphere.center.set(x, y, z);
    this.blendToIdle();
  }

  public setVerticalBounds(minY: number, maxY: number): void {
    this.options = {
      ...this.options,
      minY,
      maxY,
    };
  }

  public flap(intensity = 1): void {
    const impulse = Math.max(0, intensity) * this.options.flapImpulse;
    this.velocityY = MathUtils.clamp(
      this.velocityY + impulse,
      -this.options.maxDownwardVelocity,
      this.options.maxUpwardVelocity,
    );
    this.triggerFlapAnimation();
  }

  public update(deltaSeconds: number, applyPhysics = true): void {
    this.mixer.update(deltaSeconds);

    if (!applyPhysics) {
      return;
    }

    const nextVelocity = MathUtils.clamp(
      this.velocityY + this.options.gravity * deltaSeconds,
      -this.options.maxDownwardVelocity,
      this.options.maxUpwardVelocity,
    );

    this.velocityY = nextVelocity;

    const newY = MathUtils.clamp(
      this.object.position.y + this.velocityY * deltaSeconds,
      this.options.minY,
      this.options.maxY,
    );

    this.object.position.y = newY;
    this.boundingSphere.center.copy(this.object.position);

    // Apply a small bank rotation based on velocity for visual feedback.
    const tilt = MathUtils.clamp(this.velocityY / this.options.maxUpwardVelocity, -1, 1);
    this.object.quaternion.slerp(TARGET_TILT.setFromAxisAngle(TILT_AXIS, -tilt * 0.4), 0.25);
  }

  public getBoundingSphere(): Sphere {
    return this.boundingSphere.clone();
  }

  public getVelocity(): number {
    return this.velocityY;
  }

  public getRadius(): number {
    return this.boundingSphere.radius;
  }

  public refreshBounds(): void {
    this.boundingSphere.center.copy(this.object.position);
  }
}
