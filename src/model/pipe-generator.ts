// File Overview: This module belongs to src/model/pipe-generator.ts.
import {
  DIFFICULTY_BANDS,
  PIPE_DISTANCE,
  PIPE_HOLL_SIZE,
  PIPE_MIN_GAP
} from '../constants';
import type { IDifficultyBand } from '../constants';
import { randomClamp } from '../utils';
import Pipe from './pipe';
import SceneGenerator from './scene-generator';
import { IPipeColor } from './pipe';
export interface IRange {
  min: number;
  max: number;
}

export interface IPipeGeneratorOption {
  max: number;
  width: number;
  height: number;
}

export interface IPipeGeneratorValue {
  position: ICoordinate;
}

export default class PipeGenerator {
  /**
   * Minimum and Maximum number to generate locate
   */
  private range: IRange;

  /**
   * Width of platform
   */
  private width: number;

  /**
   * Pipe Array
   * */
  public pipes: Pipe[];

  /**
   * Expected Distance between Pipes
   * */
  private distance: number;

  /**
   * Initial X position of new pipe
   * */
  private initialXPos: number;

  /**
   * Canvas Size
   * */
  private canvasSize: IDimension;

  private pipeColor: IPipeColor;
  private maxHeight: number;
  private difficultyIndex: number;
  private currentDifficulty: IDifficultyBand;

  constructor() {
    this.range = { max: 0, min: 0 };
    this.width = 0;
    this.pipes = [];
    this.distance = 0;
    this.initialXPos = 0;
    this.canvasSize = {
      width: 0,
      height: 0
    };
    this.pipeColor = 'green';
    this.maxHeight = 0;
    this.difficultyIndex = 0;
    this.currentDifficulty = DIFFICULTY_BANDS[0];
  }

  public reset(): void {
    this.pipes.splice(0, this.pipes.length);
    this.difficultyIndex = 0;
    this.currentDifficulty = DIFFICULTY_BANDS[0];
    this.resize({
      max: this.maxHeight,
      width: this.canvasSize.width,
      height: this.canvasSize.height
    });
    this.pipeColor = SceneGenerator.pipe;
  }

  public resize({ max, width, height }: IPipeGeneratorOption): void {
    this.maxHeight = max;
    this.width = width;
    this.canvasSize = { width, height };
    this.applyDifficultySettings();

    for (const pipe of this.pipes) {
      pipe.resize(this.canvasSize);
      pipe.setSpeedMultiplier(this.currentDifficulty.speedMultiplier);
    }
  }

  /**
   * Will return true if the distance of last pipe is equal or greater than
   * expected distance from max width
   */
  public needPipe(): boolean {
    const pipeLen = this.pipes.length;

    if (pipeLen === 0) {
      this.initialXPos = (this.width + Pipe.pipeSize.width) * 2;
      return true;
    }

    // Get the last pipe and check if the distance of it is equal or greater than max width
    if (this.distance <= this.width - this.pipes[pipeLen - 1].coordinate.x) {
      this.initialXPos = this.width + Pipe.pipeSize.width;
      return true;
    }

    return false;
  }

  /**
   * Would generate pipe with random Y position of mid point
   * and with fixed size
   */
  public generate(): IPipeGeneratorValue {
    return {
      position: {
        x: this.initialXPos,
        y: randomClamp(this.range.min, this.range.max)
      }
    };
  }

  public Update(): void {
    if (this.needPipe()) {
      const pipe = new Pipe();

      pipe.init();
      pipe.use(this.pipeColor);

      pipe.resize(this.canvasSize);
      pipe.setSpeedMultiplier(this.currentDifficulty.speedMultiplier);

      pipe.setHollPosition(this.generate().position, this.currentDifficulty.gapScale);
      this.pipes.push(pipe);
    }

    for (let index = 0; index < this.pipes.length; index++) {
      this.pipes[index].Update();
      if (this.pipes[index].isOut()) {
        this.pipes.splice(index, 1);
        index--;
      }
    }
  }

  public setDifficulty(score: number): boolean {
    const index = this.resolveDifficultyIndex(score);

    if (index === this.difficultyIndex) {
      return false;
    }

    this.difficultyIndex = index;
    this.currentDifficulty = DIFFICULTY_BANDS[index];
    this.applyDifficultySettings();

    return true;
  }

  public getCurrentDifficulty(): IDifficultyBand {
    return this.currentDifficulty;
  }

  private resolveDifficultyIndex(score: number): number {
    let currentIndex = 0;

    for (let index = 0; index < DIFFICULTY_BANDS.length; index++) {
      if (score >= DIFFICULTY_BANDS[index].threshold) {
        currentIndex = index;
      } else {
        break;
      }
    }

    return currentIndex;
  }

  private applyDifficultySettings(): void {
    if (this.canvasSize.width === 0 || this.canvasSize.height === 0) return;

    const scaledGap = this.canvasSize.height * PIPE_HOLL_SIZE * this.currentDifficulty.gapScale;
    const halfGap = scaledGap / 2;

    const min = this.canvasSize.height * PIPE_MIN_GAP + halfGap;
    const maxBound = Math.max(min + 1, this.maxHeight - halfGap);

    this.range = { min, max: maxBound };
    this.distance = this.width * PIPE_DISTANCE * this.currentDifficulty.speedMultiplier;
  }
}
