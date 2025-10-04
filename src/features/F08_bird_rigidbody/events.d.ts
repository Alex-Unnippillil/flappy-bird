import type {
  BirdRigidbodyUpdateDetail,
  GameStateChangeDetail,
  GameTickEventDetail,
} from "./types";

declare global {
  interface GameEvents {
    "game:tick": GameTickEventDetail;
    "game:state-change": GameStateChangeDetail;
    "world:reset": undefined;
  }
}

declare module "../bus" {
  interface FeatureEventMap {
    "feature:F08/bird:update": BirdRigidbodyUpdateDetail;
  }
}

export {};
