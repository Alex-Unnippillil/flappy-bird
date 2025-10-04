import type {
  FeatureF08BirdUpdateEvent,
  FeatureF12TiltEventDetail,
} from "./register";

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F08/bird:update": FeatureF08BirdUpdateEvent;
    "feature:F12/tilt": FeatureF12TiltEventDetail;
  }
}
