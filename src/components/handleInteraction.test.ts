import { describe, expect, it } from 'vitest';
import {
  CHART_HANDLE_SIZE_PX,
  getChartHandleClassName,
  getConnectorHandleStyle,
  getHandlePointerEvents,
  getV2HandleVisibilityClass,
} from './handleInteraction';

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

  it('renders selected left target ports as white circles with #C6CCD6 borders', () => {
    const style = getConnectorHandleStyle('left', true, 'all');
    expect(style.zIndex).toBe(100);
    expect(style.width).toBe(CHART_HANDLE_SIZE_PX);
    expect(style.height).toBe(CHART_HANDLE_SIZE_PX);
    expect(style.backgroundColor).toBe('#FFFFFF');
    expect(style.border).toBe('2px solid #C6CCD6');
    expect(style.borderRadius).toBe('50%');
    expect(style.boxShadow).toBe('none');
    expect(getChartHandleClassName('left')).toBe('chart-handle chart-handle--target chart-handle--left');
  });

  it('renders selected right source ports as accent circles with white borders', () => {
    const style = getConnectorHandleStyle('right', true, 'all');
    expect(style.width).toBe(CHART_HANDLE_SIZE_PX);
    expect(style.height).toBe(CHART_HANDLE_SIZE_PX);
    expect(style.backgroundColor).toBe('var(--wf-acc)');
    expect(style.border).toBe('2px solid #FFFFFF');
    expect(style.borderRadius).toBe('50%');
    expect(style.boxShadow).toBe('0 1px 3px rgba(16, 24, 40, 0.2)');
    expect(getChartHandleClassName('right')).toBe('chart-handle chart-handle--source chart-handle--right');
  });

  it('keeps source-side ports at 11px with white borders and accent shadow', () => {
    for (const side of ['top', 'right', 'bottom'] as const) {
      const style = getConnectorHandleStyle(side, true, 'all');
      expect(style.width).toBe(11);
      expect(style.height).toBe(11);
      expect(style.border).toBe('2px solid #FFFFFF');
      expect(style.backgroundColor).toBe('var(--wf-acc)');
      expect(style.boxShadow).toBe('0 1px 3px rgba(16, 24, 40, 0.2)');
      expect(getChartHandleClassName(side)).toContain('chart-handle--source');
    }
  });
});
