import type { ColorRepresentation, Scene } from "three";
import { DirectionalLight, HemisphereLight, Vector3 } from "three";

export interface HemisphereLightOptions {
  skyColor?: ColorRepresentation;
  groundColor?: ColorRepresentation;
  intensity?: number;
}

export interface DirectionalLightOptions {
  color?: ColorRepresentation;
  intensity?: number;
  position?: { x: number; y: number; z: number } | [number, number, number];
  shadow?: {
    mapSize?: number;
    bias?: number;
  };
}

export interface LightingOptions {
  /**
   * Enables shadows for the directional light. Shadows are disabled by default
   * to favor frame-rate stability on mid-range devices.
   */
  enableShadows?: boolean;
  hemisphere?: HemisphereLightOptions;
  directional?: DirectionalLightOptions;
}

export interface LightingResult {
  hemisphereLight: HemisphereLight;
  directionalLight: DirectionalLight;
}

const DEFAULT_DIRECTIONAL_POSITION = new Vector3(5, 10, 7.5);

function toVector3(
  position: DirectionalLightOptions["position"] | undefined
): Vector3 {
  if (!position) {
    return DEFAULT_DIRECTIONAL_POSITION.clone();
  }

  if (Array.isArray(position)) {
    const [x, y, z] = position;
    return new Vector3(x, y, z);
  }

  return new Vector3(position.x, position.y, position.z);
}

export function createDefaultLights(
  scene: Scene,
  options: LightingOptions = {}
): LightingResult {
  const hemisphereOptions = options.hemisphere ?? {};
  const hemisphereLight = new HemisphereLight(
    hemisphereOptions.skyColor ?? 0xffffff,
    hemisphereOptions.groundColor ?? 0x222233,
    hemisphereOptions.intensity ?? 0.6
  );
  scene.add(hemisphereLight);

  const directionalOptions = options.directional ?? {};
  const directionalLight = new DirectionalLight(
    directionalOptions.color ?? 0xffffff,
    directionalOptions.intensity ?? 0.9
  );

  directionalLight.position.copy(toVector3(directionalOptions.position));

  const enableShadows = options.enableShadows ?? false;
  directionalLight.castShadow = enableShadows;

  if (enableShadows) {
    const shadowMapSize = directionalOptions.shadow?.mapSize ?? 1024;
    directionalLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    directionalLight.shadow.bias = directionalOptions.shadow?.bias ?? -0.001;
  }

  scene.add(directionalLight);

  return { hemisphereLight, directionalLight };
}
