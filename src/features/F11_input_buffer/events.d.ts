import type {
  BirdEligibilityState,
  BufferedImpulseEvent,
} from "./register";

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F11/input-buffer:impulse": BufferedImpulseEvent;
    "feature:F11/bird:eligibility": BirdEligibilityState;
  }
}
