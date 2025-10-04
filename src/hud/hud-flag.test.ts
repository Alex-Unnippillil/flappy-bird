import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isHudEnabled } from "./hud-flag";

declare global {
  // eslint-disable-next-line no-var
  var __HUD_FLAG_IMPORT_META_ENV__: Record<string, unknown> | undefined;
}

const ORIGINAL_PROCESS_ENV = { ...process.env };
const ORIGINAL_IMPORT_META_ENV = globalThis.__HUD_FLAG_IMPORT_META_ENV__;

beforeEach(() => {
  process.env = { ...ORIGINAL_PROCESS_ENV };
  delete process.env.HUD_V1;
  delete globalThis.__HUD_FLAG_IMPORT_META_ENV__;
});

afterEach(() => {
  process.env = { ...ORIGINAL_PROCESS_ENV };
  if (ORIGINAL_IMPORT_META_ENV === undefined) {
    delete globalThis.__HUD_FLAG_IMPORT_META_ENV__;
  } else {
    globalThis.__HUD_FLAG_IMPORT_META_ENV__ = ORIGINAL_IMPORT_META_ENV;
  }
});

describe("isHudEnabled", () => {
  it("returns false when no environment variables are defined", () => {
    expect(isHudEnabled()).toBe(false);
  });

  it("respects HUD_V1 set through process.env", () => {
    process.env.HUD_V1 = "true";

    expect(isHudEnabled()).toBe(true);
  });

  it("treats false-like process.env values as disabled", () => {
    process.env.HUD_V1 = "false";

    expect(isHudEnabled()).toBe(false);
  });

  it("prefers the import.meta.env override when available", () => {
    process.env.HUD_V1 = "false";
    globalThis.__HUD_FLAG_IMPORT_META_ENV__ = { HUD_V1: "true" };

    expect(isHudEnabled()).toBe(true);
  });

  it("supports boolean values in import.meta.env", () => {
    globalThis.__HUD_FLAG_IMPORT_META_ENV__ = { HUD_V1: true };

    expect(isHudEnabled()).toBe(true);
  });
});
