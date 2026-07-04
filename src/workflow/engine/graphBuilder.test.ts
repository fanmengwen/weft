import { describe, expect, it } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { buildExecutionGraph } from './graphBuilder';

function makeEdge(source: string, target: string, sourceHandle = 'out'): FlowEdge {
  return {
    id: `${source}->${target}:${sourceHandle}`,
    source,
    target,
    sourceHandle,
    targetHandle: 'in',
  } as FlowEdge;
}

describe('buildExecutionGraph', () => {
  it('orders a linear chain topologically', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 1, y: 0 });
    const c = createWorkflowNode('output', { x: 2, y: 0 });
    const graph = buildExecutionGraph([c, b, a], [makeEdge(a.id, b.id), makeEdge(b.id, c.id)]);

    expect(graph.order).toEqual([a.id, b.id, c.id]);
    expect(graph.incomersById.get(b.id)).toEqual([a.id]);
    expect(graph.outgoingEdgesById.get(a.id)).toHaveLength(1);
  });

  it('keeps disconnected chains in stable node order', () => {
    const a1 = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b1 = createWorkflowNode('output', { x: 1, y: 0 });
    const a2 = createWorkflowNode('textInput', { x: 0, y: 1 });
    const b2 = createWorkflowNode('output', { x: 1, y: 1 });
    const graph = buildExecutionGraph(
      [a1, b1, a2, b2],
      [makeEdge(a1.id, b1.id), makeEdge(a2.id, b2.id)]
    );

    expect(graph.order).toEqual([a1.id, a2.id, b1.id, b2.id]);
  });

  it('ignores edges pointing at unknown nodes', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const graph = buildExecutionGraph([a], [makeEdge(a.id, 'ghost')]);

    expect(graph.order).toEqual([a.id]);
    expect(graph.outgoingEdgesById.get(a.id)).toEqual([]);
  });

  it('throws on cycles', () => {
    const a = createWorkflowNode('llm', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 1, y: 0 });

    expect(() =>
      buildExecutionGraph([a, b], [makeEdge(a.id, b.id), makeEdge(b.id, a.id)])
    ).toThrow(/cycle/);
  });
});
