const HUD_ENV_KEYS = ["true", "1", "yes", "on"];

type EnvValue = string | boolean | undefined;

declare global {
  // Used only within tests to simulate a Vite-like import.meta.env value.
  // eslint-disable-next-line no-var
  var __HUD_FLAG_IMPORT_META_ENV__: Record<string, unknown> | undefined;
}

const normalizeValue = (value: EnvValue): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return HUD_ENV_KEYS.includes(normalized);
  }

  return false;
};

const getFromImportMetaEnv = (): EnvValue => {
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const env = meta.env;

  if (env && "HUD_V1" in env) {
    return env.HUD_V1 as EnvValue;
  }

  const shim = globalThis.__HUD_FLAG_IMPORT_META_ENV__;
  if (shim && "HUD_V1" in shim) {
    return shim.HUD_V1 as EnvValue;
  }

  return undefined;
};

const getFromProcessEnv = (): EnvValue => {
  if (typeof process === "undefined" || !process?.env) {
    return undefined;
  }

  return process.env.HUD_V1 as EnvValue;
};

export const isHudEnabled = (): boolean => {
  const importMetaValue = getFromImportMetaEnv();
  if (importMetaValue !== undefined) {
    return normalizeValue(importMetaValue);
  }

  const processEnvValue = getFromProcessEnv();
  if (processEnvValue !== undefined) {
    return normalizeValue(processEnvValue);
  }

  return false;
};

export default isHudEnabled;
