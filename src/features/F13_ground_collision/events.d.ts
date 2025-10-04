import type {
  BirdCollisionDetail,
  BirdPositionUpdatePayload,
} from "./register";

declare module "../bus" {
  interface FeatureEventMap {
    "bird:position": BirdPositionUpdatePayload;
    "bird:collide": BirdCollisionDetail;
    "game:reset": undefined;
  }
}
