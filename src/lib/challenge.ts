// File Overview: This module belongs to src/lib/challenge.ts.
const SHARE_SEED_PARAM = 'seed';
const SHARE_SCORE_PARAM = 'score';

let challengeSeed: number | undefined;
let challengeTargetScore: number | undefined;
let activeSeed = 0;
let generatorState = 0;
let generatorInitialized = false;
let challengeParsed = false;

const randomSeedBuffer = new Uint32Array(1);

const sanitizeScore = (value: number | undefined): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.floor(value));
};

const sanitizeSeed = (value: number | undefined): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value >>> 0;
};

const generateRandomSeed = (): number => {
  if (typeof globalThis.crypto !== 'undefined' && 'getRandomValues' in globalThis.crypto) {
    globalThis.crypto.getRandomValues(randomSeedBuffer);
    return randomSeedBuffer[0]!;
  }

  return Math.floor(Math.random() * 0xffffffff);
};

const setGeneratorSeed = (seed: number): void => {
  activeSeed = seed >>> 0;
  generatorState = activeSeed | 0;
  generatorInitialized = true;
};

export interface IChallengeParameters {
  seed?: number;
  targetScore?: number;
}

export const detectChallengeFromUrl = (): IChallengeParameters | null => {
  if (challengeParsed) {
    if (challengeSeed !== undefined || challengeTargetScore !== undefined) {
      return { seed: challengeSeed, targetScore: challengeTargetScore };
    }

    return null;
  }

  challengeParsed = true;

  try {
    const url = new URL(globalThis.location.href);
    const seedParam = url.searchParams.get(SHARE_SEED_PARAM);
    const scoreParam = url.searchParams.get(SHARE_SCORE_PARAM);

    if (seedParam !== null) {
      const parsedSeed = Number.parseInt(seedParam, 10);
      challengeSeed = sanitizeSeed(parsedSeed);
    }

    if (scoreParam !== null) {
      const parsedScore = Number.parseInt(scoreParam, 10);
      challengeTargetScore = sanitizeScore(parsedScore);
    }
  } catch {
    // Ignore parsing issues and keep defaults
  }

  if (challengeSeed !== undefined || challengeTargetScore !== undefined) {
    return { seed: challengeSeed, targetScore: challengeTargetScore };
  }

  return null;
};

export const beginRun = (seed?: number): number => {
  const sanitizedSeed =
    sanitizeSeed(seed) ?? challengeSeed ?? sanitizeSeed(activeSeed) ?? generateRandomSeed();

  setGeneratorSeed(sanitizedSeed);

  return activeSeed;
};

export const ensureGenerator = (): void => {
  if (!generatorInitialized) {
    beginRun();
  }
};

export const random = (): number => {
  if (!generatorInitialized) {
    ensureGenerator();
  }

  generatorState = (generatorState + 0x6d2b79f5) | 0;
  let t = Math.imul(generatorState ^ (generatorState >>> 15), 1 | generatorState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const getCurrentSeed = (): number => activeSeed >>> 0;

export const getChallengeTargetScore = (): number | undefined => challengeTargetScore;

export const setChallengeSeed = (seed: number | undefined): void => {
  challengeSeed = sanitizeSeed(seed);
};

export const setChallengeTargetScore = (score: number | undefined): void => {
  challengeTargetScore = sanitizeScore(score);
};

export const clearChallenge = (): void => {
  challengeSeed = undefined;
  challengeTargetScore = undefined;
};

export const buildShareUrl = (score: number): string => {
  const sanitizedScore = sanitizeScore(score) ?? 0;
  const seedValue = getCurrentSeed();

  const url = new URL(globalThis.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set(SHARE_SEED_PARAM, String(seedValue));
  url.searchParams.set(SHARE_SCORE_PARAM, String(sanitizedScore));

  return url.toString();
};

export const getShareParamKeys = (): { seed: string; score: string } => ({
  seed: SHARE_SEED_PARAM,
  score: SHARE_SCORE_PARAM
});
