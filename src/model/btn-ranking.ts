// File Overview: This module belongs to src/model/btn-ranking.ts.
import PlayButton from './btn-play'; // Instead of duplicating
import SpriteDestructor from '../lib/sprite-destructor';

const RANKING_BUTTON_DEFAULT_X = 0.741;
const RANKING_BUTTON_MIRROR_X = 0.259;

/**
 * Instead of creating everything from scratch
 * Let us depend on PlayButton since they are
 * identical and just their image, x-axis, and
 * on click event are different
 * */
export default class RankingButton extends PlayButton {
  constructor() {
    super();
    this.coordinate.x = RANKING_BUTTON_DEFAULT_X;
  }

  public init(): void {
    this.img = SpriteDestructor.asset('btn-ranking');
  }

  public override setLeftHanded(isLeftHanded: boolean): void {
    this.coordinate.x = isLeftHanded
      ? RANKING_BUTTON_MIRROR_X
      : RANKING_BUTTON_DEFAULT_X;
  }
}
