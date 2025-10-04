import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  F05_FLAG_STORAGE_KEY,
  F05_SETTINGS_EVENT,
  F05_SETTINGS_STORAGE_KEY,
  registerF05SettingsContext,
  type FeatureF05SettingsUpdateDetail,
} from "../register";

describe("F05 settings context", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("returns null when the feature flag is disabled", () => {
    const context = registerF05SettingsContext({
      env: { VITE_FF_F05: "false" },
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(context).toBeNull();
  });

  it("merges import.meta.env values with local overrides", () => {
    window.localStorage.setItem(
      F05_SETTINGS_STORAGE_KEY,
      JSON.stringify({ difficulty: "easy", seed: 42 }),
    );

    const context = registerF05SettingsContext({
      env: { VITE_FF_F05: "true", VITE_API_URL: "/api" },
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(context).not.toBeNull();
    expect(context?.settings.VITE_API_URL).toBe("/api");
    expect(context?.settings.difficulty).toBe("easy");
    expect(context?.settings.seed).toBe(42);

    const initialRandom = context?.random();
    context?.prng.reset();

    expect(context?.random()).toBe(initialRandom);
  });

  it("prefers the local storage override when disabling the feature", () => {
    window.localStorage.setItem(F05_FLAG_STORAGE_KEY, "0");

    const context = registerF05SettingsContext({
      env: { VITE_FF_F05: "true" },
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(context).toBeNull();
  });

  it("enables the feature when the local storage override is truthy", () => {
    window.localStorage.setItem(F05_FLAG_STORAGE_KEY, "enabled");

    const context = registerF05SettingsContext({
      env: { VITE_FF_F05: "false" },
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(context).not.toBeNull();
  });

  it("persists updates and dispatches the update event", () => {
    const events: CustomEvent<FeatureF05SettingsUpdateDetail>[] = [];
    const handler = (event: Event) => {
      events.push(event as CustomEvent<FeatureF05SettingsUpdateDetail>);
    };

    window.addEventListener(F05_SETTINGS_EVENT, handler as EventListener);

    const context = registerF05SettingsContext({
      env: { VITE_FF_F05: "true" },
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(context).not.toBeNull();

    context?.update({ theme: "night" });

    const storedRaw = window.localStorage.getItem(F05_SETTINGS_STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    expect(JSON.parse(storedRaw ?? "{}")).toMatchObject({ theme: "night" });

    expect(events).toHaveLength(1);
    expect(events[0].detail.settings.theme).toBe("night");

    window.removeEventListener(F05_SETTINGS_EVENT, handler as EventListener);
  });

  it("re-seeds the PRNG when the seed changes", () => {
    const env = { VITE_FF_F05: "true" };

    const context = registerF05SettingsContext({
      env,
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(context).not.toBeNull();

    context?.update({ seed: 123 });

    const valueAfterUpdate = context?.random();

    const rehydrated = registerF05SettingsContext({
      env,
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(rehydrated).not.toBeNull();
    expect(rehydrated?.settings.seed).toBe(123);
    expect(rehydrated?.random()).toBe(valueAfterUpdate);
  });

  it("removes local overrides when setting values to undefined", () => {
    const context = registerF05SettingsContext({
      env: { VITE_FF_F05: "true", theme: "classic" },
      storage: window.localStorage,
      eventTarget: window,
    });

    expect(context).not.toBeNull();

    context?.update({ theme: "dark" });
    expect(context?.settings.theme).toBe("dark");

    context?.update({ theme: undefined });

    expect(context?.settings.theme).toBe("classic");

    const storedRaw = window.localStorage.getItem(F05_SETTINGS_STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    const parsed = JSON.parse(storedRaw ?? "{}");
    expect(parsed.theme).toBeUndefined();
  });
});
