import type { EventBus } from "./eventBus";

export interface BirdLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PipeLike {
  x: number;
  width: number;
  topHeight: number;
  gapSize: number;
  canvasHeight: number;
}

export interface GroundLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GameOverReason = "pipe" | "ground" | "ceiling";

export interface GameOverEvent {
  reason: GameOverReason;
  bird: BirdLike;
  pipe?: PipeLike;
}

export interface CollisionEvents {
  "game:over": GameOverEvent;
}

export interface CollisionSystemOptions {
  eventBus: EventBus<CollisionEvents>;
  getGroundBox: () => GroundLike;
}

export interface CollisionResult {
  collided: boolean;
  reason?: GameOverReason;
  pipe?: PipeLike;
}

export interface PipeDebugBoxes {
  top: BoundingBox;
  bottom: BoundingBox;
  pipe: PipeLike;
}

export interface CollisionDebugSnapshot {
  bird: BoundingBox;
  ground: BoundingBox;
  pipes: PipeDebugBoxes[];
}

export function createBirdAABB(bird: BirdLike): BoundingBox {
  return {
    x: bird.x,
    y: bird.y,
    width: bird.width,
    height: bird.height,
  };
}

export function createPipeAABBs(pipe: PipeLike): { top: BoundingBox; bottom: BoundingBox } {
  const top: BoundingBox = {
    x: pipe.x,
    y: 0,
    width: pipe.width,
    height: pipe.topHeight,
  };

  const bottomStartY = pipe.topHeight + pipe.gapSize;
  const bottom: BoundingBox = {
    x: pipe.x,
    y: bottomStartY,
    width: pipe.width,
    height: Math.max(0, pipe.canvasHeight - bottomStartY),
  };

  return { top, bottom };
}

export function createGroundAABB(ground: GroundLike): BoundingBox {
  return {
    x: ground.x,
    y: ground.y,
    width: ground.width,
    height: ground.height,
  };
}

export function intersects(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function createCollisionSystem({
  eventBus,
  getGroundBox,
}: CollisionSystemOptions) {
  function emitGameOver(reason: GameOverReason, bird: BirdLike, pipe?: PipeLike) {
    eventBus.emit("game:over", { reason, bird, pipe });
  }

  function checkCollisions(bird: BirdLike, pipes: readonly PipeLike[]): CollisionResult {
    const birdBox = createBirdAABB(bird);

    if (birdBox.y < 0) {
      emitGameOver("ceiling", bird);
      return { collided: true, reason: "ceiling" };
    }

    const groundBox = createGroundAABB(getGroundBox());
    if (intersects(birdBox, groundBox)) {
      emitGameOver("ground", bird);
      return { collided: true, reason: "ground" };
    }

    for (const pipe of pipes) {
      const { top, bottom } = createPipeAABBs(pipe);
      if (intersects(birdBox, top) || intersects(birdBox, bottom)) {
        emitGameOver("pipe", bird, pipe);
        return { collided: true, reason: "pipe", pipe };
      }
    }

    return { collided: false };
  }

  function getDebugSnapshot(bird: BirdLike, pipes: readonly PipeLike[]): CollisionDebugSnapshot {
    const birdBox = createBirdAABB(bird);
    const groundBox = createGroundAABB(getGroundBox());
    const pipeBoxes = pipes.map((pipe) => {
      const { top, bottom } = createPipeAABBs(pipe);
      return { top, bottom, pipe };
    });

    return { bird: birdBox, ground: groundBox, pipes: pipeBoxes };
  }

  return {
    checkCollisions,
    getDebugSnapshot,
    getBirdAABB: createBirdAABB,
    getPipeAABBs: createPipeAABBs,
    getGroundAABB: createGroundAABB,
    intersects,
  };
}
