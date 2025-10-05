/**
 * Model Summary:
 * Purpose: Defines the rate button, a PlayButton derivative that links players to the repository.
 * Update/Display: Reuses PlayButton's hover-driven `Update()` and centered `Display()` logic.
 * Public API: init(), click(), inherited onClick handling if needed.
 * Constants: None.
 * Interactions: Extends PlayButton, swaps the sprite via SpriteDestructor, and uses openInNewTab to launch the external URL.
 */
import PlayButton from './btn-play'; // Instead of duplicating
import SpriteDestructor from '../lib/sprite-destructor';
import { openInNewTab } from '../utils';

/**
 * Instead of creating everything from scratch
 * Let us depend on PlayButton since they have
 * a lot of similarities
 * */
export default class RateNutton extends PlayButton {
  constructor() {
    super();
    this.initialWidth = 0.24;
    this.coordinate.x = 0.5;
    this.coordinate.y = 0.53;
  }

  public init(): void {
    this.img = SpriteDestructor.asset('btn-rate');
  }

  public click(): void {
    // Do rate
    // Open new Tab the goto to Github Repository

    // Hard Coded
    openInNewTab('https://github.com/jxmked/Flappybird');
  }
}
