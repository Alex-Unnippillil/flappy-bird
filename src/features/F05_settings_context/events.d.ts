import type { FeatureF05SettingsUpdateDetail } from "./register";

declare global {
  interface WindowEventMap {
    "feature:F05/settings:update": CustomEvent<FeatureF05SettingsUpdateDetail>;
  }
}

export {};
