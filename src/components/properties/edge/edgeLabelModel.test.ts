import { describe, expect, it } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { buildEdgeLabelUpdates, getEditableEdgeLabel } from './edgeLabelModel';

function createEdge(overrides: Partial<FlowEdge> = {}): FlowEdge {
  return {
    id: 'edge-1',
    source: 'a',
    target: 'b',
    data: {},
    ...overrides,
  };
}

describe('edgeLabelModel', () => {
  it('reads and writes top-level labels for standard edges', () => {
    const edge = createEdge({ label: 'Sync' });

    expect(getEditableEdgeLabel(edge)).toBe('Sync');
    expect(buildEdgeLabelUpdates('Async')).toEqual({ label: 'Async' });
  });

  it('clears the label when the input is blank', () => {
    expect(buildEdgeLabelUpdates('   ')).toEqual({ label: undefined });
  });
});
