// File Overview: This module belongs to src/model/btn-share.ts.
import PlayButton from './btn-play';
import SpriteDestructor from '../lib/sprite-destructor';

export default class ShareButton extends PlayButton {
  constructor() {
    super();
    this.initialWidth = 0.32;
    this.coordinate.x = 0.5;
  }

  public init(): void {
    this.img = SpriteDestructor.asset('btn-share');
  }
}
