import { describe, expect, it } from 'vitest';
import { Bird, Pipe } from '../game/entities/index.js';
import type { GameState } from '../game/systems/state.js';
import { createRenderer } from './index';

type FillTextCall = [string, number, number, number | undefined];

function createMockContext() {
  const fillTextCalls: FillTextCall[] = [];
  const noop = () => {};

  const ctx: Partial<CanvasRenderingContext2D> = {
    clearRect: noop as CanvasRenderingContext2D['clearRect'],
    fillRect: noop as CanvasRenderingContext2D['fillRect'],
    beginPath: noop as CanvasRenderingContext2D['beginPath'],
    closePath: noop as CanvasRenderingContext2D['closePath'],
    ellipse: noop as CanvasRenderingContext2D['ellipse'],
    arc: noop as CanvasRenderingContext2D['arc'],
    moveTo: noop as CanvasRenderingContext2D['moveTo'],
    lineTo: noop as CanvasRenderingContext2D['lineTo'],
    fill: noop as CanvasRenderingContext2D['fill'],
    strokeRect: noop as CanvasRenderingContext2D['strokeRect'],
    createLinearGradient: (() => ({ addColorStop: noop })) as CanvasRenderingContext2D['createLinearGradient'],
    createRadialGradient: (() => ({ addColorStop: noop })) as CanvasRenderingContext2D['createRadialGradient'],
    fillText: ((text: string, x: number, y: number, maxWidth?: number) => {
      fillTextCalls.push([text, x, y, maxWidth]);
    }) as CanvasRenderingContext2D['fillText'],
  };

  Object.assign(ctx, {
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: 'start',
    lineWidth: 0,
  });

  return { ctx: ctx as CanvasRenderingContext2D, fillTextCalls };
}

function createMockState() {
  const { ctx, fillTextCalls } = createMockContext();
  const canvas = {
    width: 400,
    height: 400,
    dataset: {} as DOMStringMap,
    style: { background: '' } as CSSStyleDeclaration,
  } as unknown as HTMLCanvasElement;

  const bird = new Bird(50, 200);
  const pipe = new Pipe(200, 400, 120);

  const state: GameState = {
    canvas,
    ctx,
    bird,
    pipes: [pipe],
    score: 5,
    gameOver: false,
    frameCount: 0,
    pipeSpeed: 2,
    animationFrameId: null,
  };

  return { state, fillTextCalls };
}

describe('renderer selection', () => {
  it('initialises and renders the 2D renderer without affecting gameplay state', () => {
    const renderer = createRenderer('2d');
    const { state, fillTextCalls } = createMockState();

    renderer.setup(state);
    renderer.renderFrame(state);

    expect(state.canvas.dataset.theme).toBe('2d');
    expect(fillTextCalls[0]?.[0]).toContain('Score');
    expect(state.gameOver).toBe(false);
  });

  it('initialises and renders the 3D renderer without affecting gameplay state', () => {
    const renderer = createRenderer('3d');
    const { state, fillTextCalls } = createMockState();

    renderer.setup(state);
    renderer.renderFrame(state);

    expect(state.canvas.dataset.theme).toBe('3d');
    expect((state.canvas.style as unknown as { background: string }).background).toContain('#0b1d26');
    expect(fillTextCalls[0]?.[0]).toContain('Score');
    expect(state.gameOver).toBe(false);
  });
});
