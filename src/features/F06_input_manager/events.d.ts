import type { InputFlapEvent } from "./register";

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F06/input:flap": InputFlapEvent;
  }
}
