import { GAME_SPEED, PIPE_DISTANCE } from '../constants';
import type { Dimension } from '../types';
import { PipePair, type PipeColor, randomGapCenter } from './PipePair';
import type { SpriteSheet } from '../spriteSheet';

export class PipeField {
  private pipes: PipePair[] = [];
  private spawnTimer = 0;
  private spriteSheet: SpriteSheet | null = null;
  private readonly colors: PipeColor[] = ['green', 'red'];

  constructor(private readonly canvasSize: Dimension, private platformHeight: number) {}

  reset(): void {
    this.pipes = [];
    this.spawnTimer = 0;
  }

  setSpriteSheet(sheet: SpriteSheet | null): void {
    this.spriteSheet = sheet;
    for (const pipe of this.pipes) {
      pipe.setSpriteSheet(sheet);
    }
  }

  setPlatformHeight(height: number): void {
    this.platformHeight = height;
  }

  getPipes(): PipePair[] {
    return this.pipes;
  }

  forceSpawn(count = 1, spacing = this.canvasSize.width * PIPE_DISTANCE): void {
    for (let i = 0; i < count; i += 1) {
      const startX = this.canvasSize.width + i * spacing;
      this.spawnPipe(startX);
    }
  }

  update(deltaFrames: number, speedPerFrame: number): void {
    const effectiveSpeed = speedPerFrame || GAME_SPEED * this.canvasSize.width;
    const spawnInterval = (PIPE_DISTANCE * this.canvasSize.width) / effectiveSpeed;
    this.spawnTimer += deltaFrames;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;
      this.spawnPipe();
    }

    for (let i = this.pipes.length - 1; i >= 0; i -= 1) {
      const pipe = this.pipes[i];
      pipe.update(deltaFrames, effectiveSpeed);
      if (pipe.isOffscreen()) {
        this.pipes.splice(i, 1);
      }
    }
  }

  private spawnPipe(startX?: number): void {
    const pipe = new PipePair(
      this.canvasSize,
      startX ?? this.canvasSize.width,
      randomGapCenter(this.canvasSize, this.platformHeight)
    );
    pipe.x += pipe.width;
    pipe.setSpriteSheet(this.spriteSheet);
    pipe.setColor(this.randomColor());
    this.pipes.push(pipe);
  }

  private randomColor(): PipeColor {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}
