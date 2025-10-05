/**
 * Model Summary:
 * Purpose: Provides a ranking button variant that reuses PlayButton positioning and hover behavior with a different sprite.
 * Update/Display: Inherits Update()/Display() from PlayButton to manage hover animation and rendering.
 * Public API: init(), inherited onClick/click handlers from PlayButton.
 * Constants: None.
 * Interactions: Shares behavior with PlayButton and pulls its artwork via SpriteDestructor; intended to trigger external leaderboard flows.
 */
import PlayButton from './btn-play'; // Instead of duplicating
import SpriteDestructor from '../lib/sprite-destructor';

/**
 * Instead of creating everything from scratch
 * Let us depend on PlayButton since they are
 * identical and just their image, x-axis, and
 * on click event are different
 * */
export default class RankingButton extends PlayButton {
  constructor() {
    super();
    this.coordinate.x = 0.741;
  }

  public init(): void {
    this.img = SpriteDestructor.asset('btn-ranking');
  }
}
