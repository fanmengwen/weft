import { describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { serializeCanvasContextForAI } from './contextSerializer';

function createNode(id: string, type: string, label: string): FlowNode {
  return {
    id,
    type,
    position: { x: 10, y: 20 },
    data: { label },
  };
}

function createEdge(id: string, source: string, target: string, label?: string): FlowEdge {
  return {
    id,
    source,
    target,
    label,
    type: 'smoothstep',
    data: {},
  };
}

describe('serializeCanvasContextForAI', () => {
  it('serializes nodes/edges with deterministic summary fields', () => {
    const nodes = [createNode('n1', 'process', 'A'), createNode('n2', 'decision', 'B')];
    const edges = [createEdge('e1', 'n1', 'n2', 'yes')];

    const serialized = serializeCanvasContextForAI(nodes, edges);
    const parsed = JSON.parse(serialized) as {
      summary: { nodeCount: number; edgeCount: number; nodeTypes: Record<string, number> };
      nodes: Array<{ id: string; label: string }>;
      edges: Array<{ source: string; target: string; label?: string }>;
    };

    expect(parsed.summary.nodeCount).toBe(2);
    expect(parsed.summary.edgeCount).toBe(1);
    expect(parsed.summary.nodeTypes.process).toBe(1);
    expect(parsed.summary.nodeTypes.decision).toBe(1);
    expect(parsed.nodes[0].id).toBe('n1');
    expect(parsed.edges[0].label).toBe('yes');
  });
});
