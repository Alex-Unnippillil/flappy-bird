// @ts-nocheck

/**
 * @typedef {Object} InvincibilityState
 * @property {boolean} isActive
 * @property {number} expiresAt
 */

/**
 * @typedef {Object} InvinciblePowerUpContext
 * @property {InvincibilityState} invincibility
 * @property {{ isInvincible?: boolean } | null} bird
 */

/**
 * Handles temporary invincibility for the bird, disabling collisions while active.
 */
export class InvinciblePowerUp {
   /**
    * @param {{ durationMs?: number }} [options]
    */
   constructor(options = {}) {
     const { durationMs = 5000 } = options;
     this.durationMs = durationMs;
     this.active = false;
     this.expiresAt = 0;
   }
 
   /**
    * Activates the power-up, applying invincibility to the provided context.
    * @param {InvinciblePowerUpContext} context
    * @param {number} [currentTime]
    */
   activate(context, currentTime = performance.now()) {
     this.active = true;
     this.expiresAt = currentTime + this.durationMs;
     this.applyState(context);
   }
 
   /**
    * Updates the power-up timer and applies or clears the active state.
    * @param {InvinciblePowerUpContext} context
    * @param {number} [currentTime]
    */
   update(context, currentTime = performance.now()) {
     if (!this.active) {
       this.clearState(context);
       return;
     }
 
     if (currentTime >= this.expiresAt) {
       this.reset(context);
       return;
     }
 
     this.applyState(context);
   }
 
   /**
    * Resets the power-up, clearing invincibility from the context.
    * @param {InvinciblePowerUpContext} context
    */
   reset(context) {
     this.active = false;
     this.expiresAt = 0;
     this.clearState(context);
   }
 
   /**
    * @returns {boolean}
    */
   get isActive() {
     return this.active;
   }
 
   /**
    * Returns the remaining active time in milliseconds.
    * @param {number} [currentTime]
    * @returns {number}
    */
   getRemainingTime(currentTime = performance.now()) {
     if (!this.active) {
       return 0;
     }
 
     return Math.max(0, this.expiresAt - currentTime);
   }
 
   /**
    * @param {InvinciblePowerUpContext} context
    */
   applyState(context) {
     const { invincibility, bird } = context;
     invincibility.isActive = true;
     invincibility.expiresAt = this.expiresAt;
 
     if (bird) {
       bird.isInvincible = true;
     }
   }
 
   /**
    * @param {InvinciblePowerUpContext} context
    */
   clearState(context) {
     const { invincibility, bird } = context;
     invincibility.isActive = false;
     invincibility.expiresAt = 0;
 
     if (bird) {
       bird.isInvincible = false;
     }
   }
 }
