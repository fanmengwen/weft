/** Flat 20% zoom grid: 100% → 120% → 140% (snaps intermediate wheel values). */
export const CANVAS_ZOOM_STEP = 0.2;
export const CANVAS_ZOOM_MIN = 0.2;
export const CANVAS_ZOOM_MAX = 2;
export const CANVAS_DEFAULT_ZOOM = 1;

const EPS = 1e-6;

export const CANVAS_DEFAULT_VIEWPORT = {
  x: 0,
  y: 0,
  zoom: CANVAS_DEFAULT_ZOOM,
} as const;

export function nextCanvasZoom(zoom: number, direction: 1 | -1): number {
  const next =
    direction === 1
      ? (Math.floor(zoom / CANVAS_ZOOM_STEP + EPS) + 1) * CANVAS_ZOOM_STEP
      : (Math.ceil(zoom / CANVAS_ZOOM_STEP - EPS) - 1) * CANVAS_ZOOM_STEP;
  const clamped = Math.min(CANVAS_ZOOM_MAX, Math.max(CANVAS_ZOOM_MIN, next));
  return Math.round(clamped * 10) / 10;
}
