// File Overview: This module belongs to src/model/scene-generator.ts.
import { randomClamp } from '../utils';
import { ITheme } from './background';
import { IBirdColor } from './bird';
import { IPipeColor } from './pipe';

export default class SceneGenerator {
  private static readonly SCORE_STEP = 10;
  private static readonly CYCLE_DURATION = 25000; // ms
  public static birdColorList: IBirdColor[] = [];
  public static bgThemeList: ITheme[] = [];
  public static pipeColorList: IPipeColor[] = [];
  private static nightFlag = false;
  private static currentTheme: ITheme = 'day';
  private static lastToggleTime = 0;
  private static nextScoreMilestone = SceneGenerator.SCORE_STEP;

  public static get background(): ITheme {
    SceneGenerator.ensureTheme(SceneGenerator.currentTheme);
    return SceneGenerator.currentTheme;
  }

  public static get isNight(): boolean {
    return SceneGenerator.nightFlag;
  }

  public static resetCycle(theme: ITheme = 'day'): void {
    SceneGenerator.ensureTheme(theme);
    SceneGenerator.setTheme(theme);
    SceneGenerator.lastToggleTime = SceneGenerator.now();
    SceneGenerator.nextScoreMilestone = SceneGenerator.SCORE_STEP;
  }

  public static tick(score: number): ITheme | null {
    const now = SceneGenerator.now();
    const reachedTime = now - SceneGenerator.lastToggleTime >= SceneGenerator.CYCLE_DURATION;
    const reachedScore = score >= SceneGenerator.nextScoreMilestone && score > 0;

    if (!reachedTime && !reachedScore) return null;

    if (reachedScore) {
      SceneGenerator.nextScoreMilestone = SceneGenerator.computeNextMilestone(score);
    } else if (score >= SceneGenerator.nextScoreMilestone) {
      SceneGenerator.nextScoreMilestone = SceneGenerator.computeNextMilestone(score);
    }

    SceneGenerator.lastToggleTime = now;
    const nextTheme = SceneGenerator.currentTheme === 'night' ? 'day' : 'night';
    SceneGenerator.ensureTheme(nextTheme);
    SceneGenerator.setTheme(nextTheme);
    return SceneGenerator.currentTheme;
  }

  public static get bird(): IBirdColor {
    if (SceneGenerator.birdColorList.length < 1)
      throw new Error('No available bird color');

    return SceneGenerator.birdColorList[
      randomClamp(0, SceneGenerator.birdColorList.length)
    ];
  }

  public static get pipe(): IPipeColor {
    const preferred = SceneGenerator.nightFlag ? 'red' : 'green';

    if (SceneGenerator.pipeColorList.length < 1)
      return preferred as IPipeColor;

    if (SceneGenerator.pipeColorList.includes(preferred as IPipeColor))
      return preferred as IPipeColor;

    return SceneGenerator.pipeColorList[0];
  }

  private static setTheme(theme: ITheme): void {
    SceneGenerator.currentTheme = theme;
    SceneGenerator.nightFlag = theme === 'night';
  }

  private static ensureTheme(theme: ITheme): void {
    if (!SceneGenerator.bgThemeList.includes(theme)) {
      SceneGenerator.bgThemeList.push(theme);
    }
  }

  private static computeNextMilestone(score: number): number {
    const buckets = Math.floor(score / SceneGenerator.SCORE_STEP) + 1;
    return buckets * SceneGenerator.SCORE_STEP;
  }

  private static now(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }

    return Date.now();
  }
}
