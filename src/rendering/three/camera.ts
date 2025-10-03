import { MathUtils, PerspectiveCamera, Vector3 } from "three";

export interface DynamicFovConfig {
  /**
   * Base vertical field of view used as the starting point for the reference aspect ratio.
   * Defaults to 45 degrees which offers a balanced perspective for side scrollers.
   */
  baseFov?: number;
  /**
   * Lowest field of view that will be used regardless of viewport aspect ratio.
   */
  minFov?: number;
  /**
   * Highest field of view that will be used regardless of viewport aspect ratio.
   */
  maxFov?: number;
  /**
   * Aspect ratio that the base FOV is calibrated against (width / height).
   */
  referenceAspect?: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface CreateCameraOptions extends DynamicFovConfig {
  near?: number;
  far?: number;
  /**
   * Offsets applied when positioning the camera during creation. They are relative to the
   * focus point computed during the first update.
   */
  offsets?: Partial<CameraOffset>;
}

export interface CameraOffset {
  /** Positive numbers move the camera to the left of the focus point (negative X direction). */
  horizontal: number;
  /** Positive numbers move the camera upwards relative to the focus point. */
  vertical: number;
  /**
   * Positive numbers move the camera away from the play space along the Z axis. The game world
   * is assumed to exist near Z = 0 with the camera looking towards positive X.
   */
  depth: number;
}

export interface BirdTarget {
  position: Vector3;
  /** Approximate radius of the bird model. */
  radius?: number;
}

export interface PipeTarget {
  /** Center point of the next pipe gap. */
  position: Vector3;
  /** Height of the navigable gap between the upper and lower pipe. */
  gapHeight?: number;
}

export interface CameraUpdateOptions extends DynamicFovConfig {
  viewport: ViewportDimensions;
  /**
   * Minimum lead distance (in world units) the camera should look ahead of the bird so players
   * can anticipate upcoming pipes.
   */
  minLead?: number;
  /** Maximum lead distance when a pipe is far ahead. */
  maxLead?: number;
  /**
   * Amount of interpolation applied when moving towards the desired camera position. Values
   * should be between 0 and 1, where higher numbers produce faster convergence.
   */
  smoothing?: number;
  /** Additional space to keep visible vertically besides the bird and pipe gap. */
  verticalPadding?: number;
  /** Minimum vertical span of the viewport in world units. */
  minVerticalSpan?: number;
  /**
   * Extra depth added after calculating the minimum distance required to fit the vertical span.
   */
  distancePadding?: number;
  /** Minimum distance from the focus point along the depth axis. */
  minDistance?: number;
  /** Maximum distance from the focus point along the depth axis. */
  maxDistance?: number;
  /**
   * Relative weight [0, 1] used when blending the pipe gap height with the bird's altitude to
   * compute the vertical focus point. Higher values bias the camera towards the pipe gap.
   */
  pipeFocusWeight?: number;
  /** Camera offsets applied when positioning it relative to the focus point. */
  offsets?: Partial<CameraOffset>;
}

const DEFAULT_CAMERA_OFFSET: CameraOffset = {
  horizontal: 12,
  vertical: 1.5,
  depth: 30,
};

const DEFAULT_DYNAMIC_FOV: Required<DynamicFovConfig> = {
  baseFov: 45,
  minFov: 35,
  maxFov: 75,
  referenceAspect: 16 / 9,
};

const CAMERA_USER_DATA_KEYS = {
  focusPoint: "focusPoint",
  positionTarget: "positionTarget",
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveOffset(overrides?: Partial<CameraOffset>): CameraOffset {
  return {
    horizontal: overrides?.horizontal ?? DEFAULT_CAMERA_OFFSET.horizontal,
    vertical: overrides?.vertical ?? DEFAULT_CAMERA_OFFSET.vertical,
    depth: overrides?.depth ?? DEFAULT_CAMERA_OFFSET.depth,
  };
}

/**
 * Calculates a field of view that adapts to the viewport aspect ratio. The implementation keeps
 * the vertical composition similar across devices by gradually widening the FOV on tall screens
 * and slightly tightening it on extra-wide screens while respecting configured bounds.
 */
export function getDynamicFov(
  viewport: ViewportDimensions,
  config: DynamicFovConfig = {}
): number {
  const { baseFov, minFov, maxFov, referenceAspect } = { ...DEFAULT_DYNAMIC_FOV, ...config };
  const aspect = viewport.width / viewport.height;

  if (!Number.isFinite(aspect) || aspect <= 0) {
    return clamp(baseFov, minFov, maxFov);
  }
  const aspectRatioFactor = aspect / referenceAspect;

  let fov = baseFov;

  if (aspectRatioFactor < 1) {
    // Tall screens get a wider FOV so the vertical play space stays visible.
    fov *= 1 / aspectRatioFactor;
  } else if (aspectRatioFactor > 1) {
    // For wide screens ease into a tighter FOV to avoid extreme distortion.
    fov *= 1 / Math.sqrt(aspectRatioFactor);
  }

  return clamp(fov, minFov, maxFov);
}

/**
 * Creates a camera configured for a side-scrolling scene. The camera stores auxiliary vectors in
 * {@link PerspectiveCamera.userData} so subsequent updates can move smoothly without re-creating
 * temporary objects on every frame.
 */
export function createSideScrollerCamera(
  viewport: ViewportDimensions,
  options: CreateCameraOptions = {}
): PerspectiveCamera {
  const { near = 0.1, far = 500, offsets, ...fovConfig } = options;
  const fov = getDynamicFov(viewport, fovConfig);
  const camera = new PerspectiveCamera(fov, viewport.width / viewport.height, near, far);
  const offset = resolveOffset(offsets);

  // Initialize position so that the first update has a sensible starting point.
  camera.position.set(-offset.horizontal, offset.vertical, offset.depth);
  camera.lookAt(new Vector3(0, 0, 0));

  camera.userData[CAMERA_USER_DATA_KEYS.focusPoint] = new Vector3(0, 0, 0);
  camera.userData[CAMERA_USER_DATA_KEYS.positionTarget] = camera.position.clone();

  return camera;
}

/**
 * Updates the camera to keep the bird and the next pipe comfortably in frame. The function
 * adjusts the field of view, smoothly tracks the point between the bird and the pipe gap, and
 * nudges the camera backwards when a taller vertical span needs to be displayed.
 */
export function updateSideScrollerCamera(
  camera: PerspectiveCamera,
  bird: BirdTarget,
  options: CameraUpdateOptions,
  nextPipe?: PipeTarget
): void {
  const {
    viewport,
    minLead = 6,
    maxLead = 18,
    smoothing = 0.12,
    verticalPadding = 2,
    minVerticalSpan = 10,
    distancePadding = 2,
    minDistance = 16,
    maxDistance = 45,
    pipeFocusWeight = 0.35,
    offsets,
    ...fovConfig
  } = options;

  const clampedSmoothing = clamp(smoothing, 0, 1);
  const offset = resolveOffset(offsets);

  const fov = getDynamicFov(viewport, fovConfig);
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
  }

  const birdRadius = bird.radius ?? 0.6;
  const pipeGapHeight = nextPipe?.gapHeight ?? birdRadius * 4;
  const pipeWeight = nextPipe ? clamp(pipeFocusWeight, 0, 1) : 0;

  const horizontalGap = nextPipe
    ? Math.max(nextPipe.position.x - bird.position.x, 0)
    : minLead;

  const lead = clamp(horizontalGap * 0.5 + minLead * 0.5, minLead, maxLead);
  const focusX = bird.position.x + lead;
  const pipeY = nextPipe?.position.y ?? bird.position.y;
  const focusY = MathUtils.lerp(bird.position.y, pipeY, pipeWeight);

  const verticalSpan = Math.max(
    minVerticalSpan,
    Math.max(birdRadius * 2 + verticalPadding, pipeGapHeight + verticalPadding)
  );

  const requiredDistance =
    verticalSpan * 0.5 / Math.tan(MathUtils.degToRad(camera.fov * 0.5)) + distancePadding;
  const baseDepth = clamp(requiredDistance, minDistance, maxDistance);
  const distance = Math.max(baseDepth, offset.depth);

  const desiredPosition = new Vector3(focusX - offset.horizontal, focusY + offset.vertical, distance);
  const positionTarget = (camera.userData[CAMERA_USER_DATA_KEYS.positionTarget] as Vector3 | undefined) ??
    camera.position.clone();

  positionTarget.lerp(desiredPosition, clampedSmoothing);
  camera.position.copy(positionTarget);
  camera.userData[CAMERA_USER_DATA_KEYS.positionTarget] = positionTarget;

  const desiredFocus = new Vector3(focusX, focusY, 0);
  const focusPoint = (camera.userData[CAMERA_USER_DATA_KEYS.focusPoint] as Vector3 | undefined) ??
    desiredFocus.clone();

  focusPoint.lerp(desiredFocus, clampedSmoothing);
  camera.userData[CAMERA_USER_DATA_KEYS.focusPoint] = focusPoint;

  camera.lookAt(focusPoint);
}
