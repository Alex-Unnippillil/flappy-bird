import { describe, expect, it } from "vitest";
import {
  createCollisionSystem,
  createBirdAABB,
  createPipeAABBs,
  createGroundAABB,
  type BirdLike,
  type PipeLike,
  type GroundLike,
  type CollisionEvents,
} from "../collision";
import { createEventBus } from "../eventBus";

describe("collision system", () => {
  const baseGround: GroundLike = { x: 0, y: 300, width: 500, height: 0 };

  function createSystem(onEvent: (event: CollisionEvents["game:over"]) => void) {
    const bus = createEventBus<CollisionEvents>();
    bus.on("game:over", onEvent);
    const system = createCollisionSystem({
      eventBus: bus,
      getGroundBox: () => baseGround,
    });
    return system;
  }

  function createPipe(x: number, gapStart: number, gapSize: number): PipeLike {
    return {
      x,
      width: 50,
      topHeight: gapStart,
      gapSize,
      canvasHeight: 300,
    };
  }

  const bird: BirdLike = { x: 40, y: 140, width: 20, height: 20 };

  it("emits a pipe collision event when intersecting the top pipe", () => {
    const events: CollisionEvents["game:over"][] = [];
    const system = createSystem((event) => events.push(event));
    const pipe = createPipe(45, 150, 40);

    const result = system.checkCollisions({ ...bird, y: 120 }, [pipe]);

    expect(result).toMatchObject({ collided: true, reason: "pipe", pipe });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ reason: "pipe", pipe });
  });

  it("emits a pipe collision event when intersecting the bottom pipe", () => {
    const events: CollisionEvents["game:over"][] = [];
    const system = createSystem((event) => events.push(event));
    const pipe = createPipe(45, 120, 40);

    const result = system.checkCollisions({ ...bird, y: 200 }, [pipe]);

    expect(result).toMatchObject({ collided: true, reason: "pipe", pipe });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ reason: "pipe", pipe });
  });

  it("emits a ground collision event when the bird touches the ground", () => {
    const events: CollisionEvents["game:over"][] = [];
    const system = createSystem((event) => events.push(event));

    const result = system.checkCollisions({ ...bird, y: 285 }, []);

    expect(result).toMatchObject({ collided: true, reason: "ground" });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ reason: "ground" });
  });

  it("emits a ceiling collision when the bird exits the top of the canvas", () => {
    const events: CollisionEvents["game:over"][] = [];
    const system = createSystem((event) => events.push(event));

    const result = system.checkCollisions({ ...bird, y: -5 }, []);

    expect(result).toMatchObject({ collided: true, reason: "ceiling" });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ reason: "ceiling" });
  });

  it("does not emit events when no intersections occur", () => {
    const events: CollisionEvents["game:over"][] = [];
    const system = createSystem((event) => events.push(event));
    const pipe = createPipe(200, 100, 60);

    const result = system.checkCollisions(bird, [pipe]);

    expect(result).toMatchObject({ collided: false });
    expect(events).toHaveLength(0);
  });

  it("provides deterministic debug snapshots", () => {
    const system = createSystem(() => {});
    const pipe = createPipe(100, 90, 60);
    const snapshot = system.getDebugSnapshot(bird, [pipe]);

    expect(snapshot.bird).toEqual(createBirdAABB(bird));
    expect(snapshot.ground).toEqual(createGroundAABB(baseGround));

    const { top, bottom } = createPipeAABBs(pipe);
    expect(snapshot.pipes).toEqual([
      {
        top,
        bottom,
        pipe,
      },
    ]);
  });
});
