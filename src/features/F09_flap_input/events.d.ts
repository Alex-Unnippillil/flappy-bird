import type { FlapInputEvent, GameStateChangeDetail } from "./register";

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F09/flap": FlapInputEvent;
  }
}

declare global {
  interface GameEvents {
    "game:state-change": GameStateChangeDetail;
  }
}
