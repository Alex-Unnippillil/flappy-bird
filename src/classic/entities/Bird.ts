import {
  BIRD_BASE_HEIGHT,
  BIRD_HEIGHT,
  BIRD_JUMP_HEIGHT,
  BIRD_MAX_DOWN_VELOCITY,
  BIRD_MAX_UP_VELOCITY,
  BIRD_WEIGHT,
  BIRD_WIDTH,
  BIRD_X_POSITION,
} from '../constants.ts';
import { playSound } from '../assets.ts';
import type { Dimension } from '../types.ts';
import type { SpriteName, SpriteSheet } from '../spriteSheet.ts';

const BODY_COLOR = '#f7d75b';
const WING_COLOR = '#fceba2';
const BEAK_COLOR = '#f19c2b';
const EYE_COLOR = '#2b2a30';

type BirdSkin = 'yellow' | 'blue' | 'red';

const SKIN_FRAMES: Record<BirdSkin, [SpriteName, SpriteName, SpriteName]> = {
  yellow: ['bird-yellow-up', 'bird-yellow-mid', 'bird-yellow-down'],
  blue: ['bird-blue-up', 'bird-blue-mid', 'bird-blue-down'],
  red: ['bird-red-up', 'bird-red-mid', 'bird-red-down'],
};

const FRAME_DURATION = 0.18;

export class Bird {
  private position = { x: 0, y: 0 };
  private velocity = 0;
  private flapCounter = 0;
  private rotation = 0;
  private bounds = { width: BIRD_WIDTH, height: BIRD_BASE_HEIGHT };
  private alive = true;
  private spriteSheet: SpriteSheet | null = null;
  private skin: BirdSkin = 'yellow';
  private animationFrame = 0;
  private animationTimer = 0;

  constructor(private readonly canvasSize: Dimension) {
    this.reset(canvasSize);
  }

  reset(size: Dimension): void {
    const aspectRatio = BIRD_WIDTH / BIRD_BASE_HEIGHT;
    this.bounds = {
      width: aspectRatio * size.height * BIRD_HEIGHT,
      height: size.height * BIRD_HEIGHT,
    };
    this.position.x = size.width * BIRD_X_POSITION;
    this.position.y = size.height * 0.4;
    this.velocity = 0;
    this.flapCounter = 0;
    this.rotation = 0;
    this.alive = true;
    this.animationFrame = 0;
    this.animationTimer = 0;
  }

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  get width(): number {
    return this.bounds.width;
  }

  get height(): number {
    return this.bounds.height;
  }

  getRotation(): number {
    return this.rotation;
  }

  isAlive(): boolean {
    return this.alive;
  }

  kill(): void {
    this.alive = false;
  }

  flap(): void {
    if (!this.alive) return;
    this.velocity = this.canvasSize.height * BIRD_JUMP_HEIGHT;
    this.animationFrame = 0;
    this.animationTimer = 0;
    playSound('flap');
  }

  setSpriteSheet(sheet: SpriteSheet | null): void {
    this.spriteSheet = sheet;
  }

  setSkin(skin: BirdSkin): void {
    this.skin = skin;
    this.animationFrame = 0;
  }

  getSkin(): BirdSkin {
    return this.skin;
  }

  update(deltaFrames: number, size: Dimension): void {
    const gravity = size.height * BIRD_WEIGHT;
    this.velocity += gravity * deltaFrames;

    const minVelocity = size.height * BIRD_MAX_UP_VELOCITY;
    const maxVelocity = size.height * BIRD_MAX_DOWN_VELOCITY;
    this.velocity = Math.max(Math.min(this.velocity, maxVelocity), minVelocity);
    this.position.y += this.velocity * deltaFrames;

    if (!this.alive) {
      this.rotation = Math.min(this.rotation + 0.08 * deltaFrames, Math.PI / 2);
      return;
    }

    this.flapCounter += deltaFrames;
    const targetRotation = Math.max(-0.4, Math.min(0.6, this.velocity / (size.height * 0.01)));
    this.rotation += (targetRotation - this.rotation) * 0.15 * deltaFrames;

    if (this.spriteSheet) {
      const frames = SKIN_FRAMES[this.skin];
      this.animationTimer += deltaFrames;
      const frameInterval = this.alive ? FRAME_DURATION : FRAME_DURATION * 1.5;
      if (this.animationTimer >= frameInterval) {
        this.animationTimer -= frameInterval;
        this.animationFrame = (this.animationFrame + 1) % frames.length;
      }
    }
  }

  getBounds() {
    return {
      left: this.position.x - this.bounds.width / 2,
      right: this.position.x + this.bounds.width / 2,
      top: this.position.y - this.bounds.height / 2,
      bottom: this.position.y + this.bounds.height / 2,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.spriteSheet) {
      const frames = SKIN_FRAMES[this.skin];
      const frameKey = frames[this.animationFrame % frames.length];
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.rotation);
      ctx.translate(-this.bounds.width / 2, -this.bounds.height / 2);
      this.spriteSheet.draw(ctx, frameKey, 0, 0, this.bounds.width, this.bounds.height);
      ctx.restore();
      return;
    }

    const wingWave = Math.sin(this.flapCounter * 0.35) * 0.5;
    const bodyRadius = this.bounds.height * 0.5;
    const wingWidth = this.bounds.width * 0.7;
    const wingHeight = this.bounds.height * 0.6;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.translate(-this.position.x, -this.position.y);

    // Body
    ctx.fillStyle = BODY_COLOR;
    ctx.beginPath();
    ctx.ellipse(this.position.x, this.position.y, this.bounds.width * 0.5, bodyRadius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.save();
    ctx.translate(this.position.x - this.bounds.width * 0.1, this.position.y);
    ctx.rotate(wingWave * 0.6);
    ctx.fillStyle = WING_COLOR;
    ctx.beginPath();
    ctx.ellipse(0, 0, wingWidth * 0.35, wingHeight * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Beak
    ctx.fillStyle = BEAK_COLOR;
    ctx.beginPath();
    ctx.moveTo(this.position.x + this.bounds.width * 0.45, this.position.y);
    ctx.lineTo(this.position.x + this.bounds.width * 0.7, this.position.y - this.bounds.height * 0.1);
    ctx.lineTo(this.position.x + this.bounds.width * 0.7, this.position.y + this.bounds.height * 0.1);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const eyeX = this.position.x + this.bounds.width * 0.2;
    const eyeY = this.position.y - this.bounds.height * 0.15;
    ctx.ellipse(eyeX, eyeY, this.bounds.width * 0.16, this.bounds.height * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = EYE_COLOR;
    ctx.beginPath();
    ctx.ellipse(eyeX + this.bounds.width * 0.04, eyeY, this.bounds.width * 0.05, this.bounds.height * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
