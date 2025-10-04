import type { BirdRigidbodyUpdateDetail } from "./types";

declare global {
  interface GameEvents {
    "world:reset": undefined;
  }
}

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F08/bird:update": BirdRigidbodyUpdateDetail;
  }
}

export {};
