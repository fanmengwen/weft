import { describe, expect, it } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { validateWorkflowGraph } from './graphValidator';

function makeEdge(source: string, target: string, sourceHandle = 'out'): FlowEdge {
  return {
    id: `${source}->${target}:${sourceHandle}`,
    source,
    target,
    sourceHandle,
    targetHandle: 'in',
  } as FlowEdge;
}

describe('validateWorkflowGraph', () => {
  it('flags an empty graph', () => {
    expect(validateWorkflowGraph([], [])).toEqual([{ code: 'emptyGraph' }]);
  });

  it('accepts a linear chain ending in output', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 1, y: 0 });
    const c = createWorkflowNode('output', { x: 2, y: 0 });

    expect(
      validateWorkflowGraph([a, b, c], [makeEdge(a.id, b.id), makeEdge(b.id, c.id)])
    ).toEqual([]);
  });

  it('flags isolated nodes', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('output', { x: 1, y: 0 });
    const lonely = createWorkflowNode('llm', { x: 2, y: 2 });

    const issues = validateWorkflowGraph([a, b, lonely], [makeEdge(a.id, b.id)]);
    expect(issues).toContainEqual({ code: 'isolatedNode', nodeIds: [lonely.id] });
  });

  it('flags nodes with multiple incoming edges', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('textInput', { x: 0, y: 1 });
    const c = createWorkflowNode('output', { x: 1, y: 0 });

    const issues = validateWorkflowGraph(
      [a, b, c],
      [makeEdge(a.id, c.id), makeEdge(b.id, c.id)]
    );
    expect(issues).toContainEqual({ code: 'multipleIncoming', nodeIds: [c.id] });
  });

  it('flags cycles', () => {
    const a = createWorkflowNode('llm', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 1, y: 0 });
    const out = createWorkflowNode('output', { x: 2, y: 0 });

    const issues = validateWorkflowGraph(
      [a, b, out],
      [makeEdge(a.id, b.id), makeEdge(b.id, a.id)]
    );
    expect(issues.map((issue) => issue.code)).toContain('cycle');
  });

  it('flags a graph without any output node', () => {
    const a = createWorkflowNode('textInput', { x: 0, y: 0 });
    const b = createWorkflowNode('llm', { x: 1, y: 0 });

    const issues = validateWorkflowGraph([a, b], [makeEdge(a.id, b.id)]);
    expect(issues).toEqual([{ code: 'missingOutput' }]);
  });
});
