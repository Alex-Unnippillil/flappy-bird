import { PHYSICS, clampFlapStrength } from "../../core/physics.ts";

const DEFAULTS = Object.freeze({
  width: 34,
  height: 24,
  flapStrength: PHYSICS.flapImpulse,
  maxFallSpeed: PHYSICS.terminalVelocity,
});

export class Bird {
  constructor(x, y, options = {}) {
    const settings = { ...DEFAULTS, ...options };

    this.x = x;
    this.y = y;
    this.width = settings.width;
    this.height = settings.height;
    this.velocity = 0;
    this.flapStrength = clampFlapStrength(settings.flapStrength);
    this.maxFallSpeed = settings.maxFallSpeed;
    this.rotation = 0;
  }

  jump() {
    this.velocity = -this.flapStrength;
  }

  update(gravity, delta = 1) {
    const scaledGravity = gravity * delta;

    this.velocity = Math.min(this.velocity + scaledGravity, this.maxFallSpeed);
    this.y += this.velocity * delta;

    const targetRotation = Math.max(-0.65, Math.min(0.75, this.velocity / 9));
    this.rotation += (targetRotation - this.rotation) * 0.2;
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }

  isOutOfBounds(playfieldHeight) {
    return this.y < 0 || this.y + this.height > playfieldHeight;
  }
}
