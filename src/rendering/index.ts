import type { Theme } from '../config';
import { create2dRenderer } from './renderer2d';
import { create3dRenderer } from './renderer3d';
import type { Renderer } from './types';

export function createRenderer(theme: Theme): Renderer {
  if (theme === '3d') {
    return create3dRenderer();
  }

  return create2dRenderer();
}
