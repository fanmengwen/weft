import { describe, expect, it } from 'vitest';
import { EDGE_CONDITION_STYLES, EDGE_STYLE } from './constants';
import { FLOW_CANVAS_STYLE_PRESETS } from './components/flow-canvas/flowCanvasReactFlowContracts';

describe('edge style constants', () => {
  it('aligns default edge stroke tokens with the chart design system', () => {
    expect(EDGE_STYLE).toEqual({ stroke: '#c3c9d3', strokeWidth: 1.6 });
    expect(EDGE_CONDITION_STYLES.default).toEqual({ stroke: '#c3c9d3', strokeWidth: 1.6 });
    expect(FLOW_CANVAS_STYLE_PRESETS.enhanced.defaultEdgeOptions.style).toEqual({
      stroke: 'var(--wf-edge)',
      strokeWidth: 1.6,
    });
    expect(FLOW_CANVAS_STYLE_PRESETS.enhanced.background).toEqual({
      variant: 'dots',
      gap: 22,
      size: 1,
      color: '#dee1e7',
    });
  });
});
