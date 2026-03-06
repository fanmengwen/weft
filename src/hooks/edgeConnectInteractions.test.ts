import { describe, expect, it } from 'vitest';
import { getPointerClientPosition, isPaneTarget, normalizeConnectionFromDragStart } from './edgeConnectInteractions';

describe('edgeConnectInteractions', () => {
  it('detects pane targets by class and ancestry', () => {
    const pane = document.createElement('div');
    pane.className = 'react-flow__pane';
    const child = document.createElement('span');
    pane.appendChild(child);

    expect(isPaneTarget(pane)).toBe(true);
    expect(isPaneTarget(child)).toBe(true);
    expect(isPaneTarget(document.createElement('div'))).toBe(false);
    expect(isPaneTarget(null)).toBe(false);
  });

  it('extracts pointer coordinates from mouse-like and touch-like events', () => {
    expect(getPointerClientPosition({ clientX: 10, clientY: 20 })).toEqual({ x: 10, y: 20 });
    expect(
      getPointerClientPosition({
        changedTouches: [{ clientX: 30, clientY: 40 }],
      })
    ).toEqual({ x: 30, y: 40 });
    expect(getPointerClientPosition({})).toBeNull();
  });

  it('preserves the drag origin as edge source in loose mode', () => {
    expect(
      normalizeConnectionFromDragStart(
        { source: 'a', target: 'c', sourceHandle: 'right', targetHandle: 'left' },
        'a',
        'right'
      )
    ).toEqual({
      source: 'a',
      target: 'c',
      sourceHandle: 'right',
      targetHandle: 'left',
    });

    expect(
      normalizeConnectionFromDragStart(
        { source: 'c', target: 'a', sourceHandle: 'left', targetHandle: 'right' },
        'a',
        'right'
      )
    ).toEqual({
      source: 'a',
      target: 'c',
      sourceHandle: 'right',
      targetHandle: 'left',
    });
  });
});
