// File Overview: This module belongs to src/model/scene-generator.ts.
import { randomClamp } from '../utils';
import { ITheme } from './background';
import { IBirdColor } from './bird';
import { IPipeColor, IPipePalette } from './pipe';

export default class SceneGenerator {
  public static birdColorList: IBirdColor[] = [];
  public static bgThemeList: ITheme[] = [];
  public static pipeColorList: IPipePalette = {
    day: ['green'],
    night: ['red']
  };
  private static isNight = false;

  public static get background(): ITheme {
    if (SceneGenerator.bgThemeList.length < 1) throw new Error('No theme available');

    const t =
      SceneGenerator.bgThemeList[randomClamp(0, SceneGenerator.bgThemeList.length)];
    SceneGenerator.isNight = t === 'night';
    return t;
  }

  public static get bird(): IBirdColor {
    if (SceneGenerator.birdColorList.length < 1)
      throw new Error('No available bird color');

    return SceneGenerator.birdColorList[
      randomClamp(0, SceneGenerator.birdColorList.length)
    ];
  }

  public static get pipe(): IPipeColor {
    const palette = SceneGenerator.isNight
      ? SceneGenerator.pipeColorList.night
      : SceneGenerator.pipeColorList.day;

    if (palette.length < 1) throw new Error('No available pipe color');

    if (!SceneGenerator.isNight) {
      // Day time always uses the classic green pipes for familiarity
      return palette[0];
    }

    return palette[randomClamp(0, palette.length)];
  }
}
