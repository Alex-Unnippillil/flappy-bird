/**
 * Global game tuning constants grouped by responsibility.
 *
 * Coordinate and velocity values are expressed as canvas ratios (0–1) unless
 * noted otherwise so they scale with the active canvas dimensions.
 *
 * Groups:
 * - Game pacing (scroll speeds, canvas sizing, audio)
 * - Bird physics (position, rotation limits, velocity caps)
 * - Pipe layout (spawn spacing, opening size, gap safety margins)
 * - HUD elements (countdown sprite sizing and positioning)
 */

// Pipe/platform scroll rate: higher values make obstacles move faster,
// reducing reaction time and increasing difficulty.
export const GAME_SPEED = 0.0062;

// Background parallax scroll rate. Kept lower than GAME_SPEED to preserve
// depth perception while matching the perceived world speed.
export const BG_SPEED = 0.0002;

// Initial Canvas Size. Changing this may cause problem in some cases.
export const CANVAS_DIMENSION = {
  width: 288,
  height: 512
};

// Sound effect volume. (0 - 1)
// Will be fed to GainNode in Audio Context
export const SFX_VOLUME = 1;

export const APP_VERSION = process.env.APP_VERSION!;

/**
 * Bird
 */

// Jump impulse applied on flap. More negative means a stronger upward boost.
export const BIRD_JUMP_HEIGHT = -0.009;

// Fixed X-Axis position of bird. Based on canvas width.
export const BIRD_X_POSITION = 0.3;

// Max angle of bird in degree
export const BIRD_MAX_ROTATION = 90;

// Minimum angle of bird in degree
export const BIRD_MIN_ROTATION = -19;

// Height of bird. Based on canvas Height
export const BIRD_HEIGHT = 0.024;

// Effective gravity strength; larger values pull the bird down faster each
// update tick.
export const BIRD_WEIGHT = 0.00047;

// Maximum lift velocity. Preventing our bird to overspeed. Based on canvas height
// Keeps consecutive flaps from stacking into unnatural vertical bursts.
export const BIRD_MAX_UP_VELOCITY = -0.3;

// Maximum drag velocity. Preventing our bird to overspeed. Based on canvas height
// Stops gravity from accelerating indefinitely, preserving reaction time near
// the ground.
export const BIRD_MAX_DOWN_VELOCITY = 0.0141;

// Initial Dimension of a bird
/**
 * We are keeping the ratio of the bird to prevent ugly looking squish or squash image of bird
 */
export const BIRD_INITIAL_DIMENSION: IDimension = {
  width: 34,
  height: 24
};

/**
 * Pipe
 */

// Distance of pipe between max width of canvas and the last pipe. (0 - 1)
// Lower values spawn pipes closer together, increasing the rate of upcoming
// obstacles and forcing quicker decision making.
export const PIPE_DISTANCE = 0.392;

// Holl size of pipe. Based on canvas height. (0 - 1)
// Larger openings provide more room for error; tightening this value makes the
// air gap narrower and more punishing.
export const PIPE_HOLL_SIZE = 0.184;

// Minimum gap of pipe holl to very top and platform. Based on height. (0 - 1)
// Acts as a safety buffer so even the most extreme hole positions remain
// passable and do not clip into the ground/ceiling.
export const PIPE_MIN_GAP = 0.194;

// Initial Pipe Dimension
export const PIPE_INITIAL_DIMENSION: IDimension = {
  width: 100,
  height: 300
};

/**
 * Background
 * */

/**
 * Count
 * */
// Initial Dimension
export const COUNT_DIMENSION: IDimension = {
  width: 24,
  height: 36
};

// Number position
export const COUNT_COORDINATE: ICoordinate = {
  x: 0.5,
  y: 0.18
};
