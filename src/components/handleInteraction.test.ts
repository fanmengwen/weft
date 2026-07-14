import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  type HandleSide,
  getChartHandleClassName,
  getConnectorHandleStyle,
  getHandlePointerEvents,
  getV2HandleVisibilityClass,
} from './handleInteraction';

const CHART_HANDLE_STYLESHEET = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');

describe('handle interaction policy', () => {
  it('keeps pointer events enabled so selected nodes remain connectable', () => {
    expect(getHandlePointerEvents(true, true)).toBe('all');
    expect(getHandlePointerEvents(true, false)).toBe('all');
    expect(getHandlePointerEvents(false, true)).toBe('all');
  });

  it('includes connecting-state class by default', () => {
    const className = getV2HandleVisibilityClass(false);
    expect(className).toContain('[.is-connecting_&]:opacity-100');
    expect(className).toContain('flow-handle-hitarea');
  });

  it('can disable connecting-state and scale classes', () => {
    const className = getV2HandleVisibilityClass(true, { includeConnectingState: false, includeScale: false });
    expect(className).toContain('opacity-80');
    expect(className).not.toContain('scale-110');
    expect(className).not.toContain('[.is-connecting_&]:opacity-100');
  });

  it('keeps connector anchors pinned to node edges even when selected', () => {
    const selectedTop = getConnectorHandleStyle('top', true, 'all');
    const unselectedTop = getConnectorHandleStyle('top', false, 'all');
    expect(selectedTop.top).toBe(0);
    expect(unselectedTop.top).toBe(0);

    const selectedRight = getConnectorHandleStyle('right', true, 'all');
    const unselectedRight = getConnectorHandleStyle('right', false, 'all');
    expect(selectedRight.left).toBe('100%');
    expect(unselectedRight.left).toBe('100%');
  });

  it('keeps connector handle styles limited to positioning and interaction', () => {
    const style = getConnectorHandleStyle('left', true, 'all');
    expect(style.zIndex).toBe(100);
    expect(style.pointerEvents).toBe('all');
    expect(style.left).toBe(0);
    expect(style.backgroundColor).toBeUndefined();
    expect(style.border).toBeUndefined();
    expect(style.width).toBeUndefined();
    expect(getChartHandleClassName('left')).toBe('chart-handle chart-handle--target chart-handle--left');
  });

  it('pins chart port visuals to stylesheet selectors', () => {
    expect(CHART_HANDLE_STYLESHEET).toContain('.react-flow__handle.chart-handle');
    expect(CHART_HANDLE_STYLESHEET).toContain('width: 11px');
    expect(CHART_HANDLE_STYLESHEET).toContain('height: 11px');
    expect(CHART_HANDLE_STYLESHEET).toContain('.react-flow__handle.chart-handle.chart-handle--target');
    expect(CHART_HANDLE_STYLESHEET).toContain('background: #ffffff');
    expect(CHART_HANDLE_STYLESHEET).toContain('border: 2px solid #c6ccd6');
    expect(CHART_HANDLE_STYLESHEET).toContain('.react-flow__handle.chart-handle.chart-handle--source');
    expect(CHART_HANDLE_STYLESHEET).toContain('background: var(--wf-acc)');
    expect(CHART_HANDLE_STYLESHEET).toContain('border: 2px solid #ffffff');
    expect(CHART_HANDLE_STYLESHEET).toContain('box-shadow: 0 1px 3px rgba(16, 24, 40, 0.2)');
    expect(getChartHandleClassName('right')).toBe('chart-handle chart-handle--source chart-handle--right');
  });

  it('keeps source-side port classes on top, right, and bottom handles', () => {
    const sides: HandleSide[] = ['top', 'right', 'bottom'];
    for (const side of sides) {
      expect(getChartHandleClassName(side)).toContain('chart-handle--source');
    }
  });
});
