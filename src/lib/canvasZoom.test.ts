import { describe, expect, it } from 'vitest';
import {
  CANVAS_DEFAULT_ZOOM,
  CANVAS_ZOOM_MAX,
  CANVAS_ZOOM_MIN,
  nextCanvasZoom,
} from './canvasZoom';

describe('nextCanvasZoom', () => {
  it('steps up by 20% from 100%', () => {
    expect(nextCanvasZoom(CANVAS_DEFAULT_ZOOM, 1)).toBeCloseTo(1.2);
  });

  it('steps down by 20% from 100%', () => {
    expect(nextCanvasZoom(CANVAS_DEFAULT_ZOOM, -1)).toBeCloseTo(0.8);
  });

  it('snaps intermediate zoom to the next 20% grid stop', () => {
    expect(nextCanvasZoom(0.85, 1)).toBeCloseTo(1);
    expect(nextCanvasZoom(0.85, -1)).toBeCloseTo(0.8);
  });

  it('clamps to min and max', () => {
    expect(nextCanvasZoom(CANVAS_ZOOM_MIN, -1)).toBe(CANVAS_ZOOM_MIN);
    expect(nextCanvasZoom(CANVAS_ZOOM_MAX, 1)).toBe(CANVAS_ZOOM_MAX);
  });
});
