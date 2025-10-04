import type { FlapPressEvent, VariableImpulseEvent } from "./register";

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F09/flap": FlapPressEvent;
    "feature:F10/impulse": VariableImpulseEvent;
  }
}
