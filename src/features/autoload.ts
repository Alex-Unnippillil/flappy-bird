import { registerF08BirdRigidbody } from "./F08_bird_rigidbody";

const truthy = new Set(["1", "true", "yes", "on", "enable", "enabled"]);

const readFlag = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return truthy.has(value.trim().toLowerCase());
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
};

const resolveEnv = (): Record<string, unknown> => {
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  return meta.env ?? {};
};

const bootstrap = () => {
  if (typeof window === "undefined") {
    return;
  }

  const env = resolveEnv();
  if (!readFlag(env.VITE_FF_F08)) {
    return;
  }

  registerF08BirdRigidbody();
};

bootstrap();
