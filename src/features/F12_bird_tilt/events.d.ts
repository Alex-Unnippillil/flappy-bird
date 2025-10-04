import type { FeatureF12TiltEventDetail } from "./register";

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F12/tilt": FeatureF12TiltEventDetail;
  }
}
