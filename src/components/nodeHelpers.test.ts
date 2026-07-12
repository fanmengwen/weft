import { describe, expect, it } from 'vitest';
import type { FlowNode } from '@/lib/types';
import {
  CHART_NODE_TONES,
  getIconAssetNodeMinSize,
  isChartNodeTone,
  resolveNodeSize,
  resolveNodeTone,
  resolveNodeToneVars,
} from './nodeHelpers';

function createNode(data: Partial<FlowNode['data']> = {}): FlowNode {
  return {
    id: 'node-1',
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      label: '',
      ...data,
    },
  } as FlowNode;
}

describe('resolveNodeTone', () => {
  it('derives kb tone for custom parallelogram nodes', () => {
    expect(resolveNodeTone({ type: 'custom', data: { label: '', shape: 'parallelogram' } })).toBe(
      'kb'
    );
  });

  it('uses stored tone override when valid', () => {
    expect(resolveNodeTone({ type: 'process', data: { label: '', tone: 'llm' } })).toBe('llm');
  });

  it('falls back to derived tone when stored tone is invalid', () => {
    expect(
      resolveNodeTone({ type: 'process', data: { label: '', tone: 'bogus' as never } })
    ).toBe('web');
  });

  it('maps tone to CSS variables via resolveNodeToneVars', () => {
    expect(resolveNodeToneVars({ type: 'start' })).toEqual({
      background: 'var(--wf-t-out-bg)',
      color: 'var(--wf-t-out-fg)',
    });
  });
});

describe('isChartNodeTone', () => {
  it.each(CHART_NODE_TONES.map((tone) => [tone, true] as const))(
    'returns true for %s',
    (tone, expected) => {
      expect(isChartNodeTone(tone)).toBe(expected);
    }
  );

  it.each(['bogus', '', null, undefined, 42])('returns false for %s', (value) => {
    expect(isChartNodeTone(value)).toBe(false);
  });
});

describe('nodeHelpers sizing', () => {
  it('returns stable icon asset minimums without a label', () => {
    expect(getIconAssetNodeMinSize(false)).toEqual({ minWidth: 96, minHeight: 88 });
  });

  it('returns stable icon asset minimums with a label', () => {
    expect(getIconAssetNodeMinSize(true)).toEqual({ minWidth: 116, minHeight: 118 });
  });

  it('uses icon asset sizing for asset presentation nodes', () => {
    const iconNode = createNode({
      label: 'Backend Bunjs',
      assetPresentation: 'icon',
    });

    expect(resolveNodeSize(iconNode)).toEqual({ width: 116, height: 118 });
  });

  it('prefers explicit dimensions when present', () => {
    const iconNode = createNode({
      label: 'Backend Bunjs',
      assetPresentation: 'icon',
      width: 180,
      height: 140,
    });

    expect(resolveNodeSize(iconNode)).toEqual({ width: 180, height: 140 });
  });
});
