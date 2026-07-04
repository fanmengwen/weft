import { describe, expect, it } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { listUpstreamVariables } from './upstreamVariables';

function makeEdge(source: string, target: string, sourceHandle = 'out'): FlowEdge {
  return {
    id: `${source}->${target}:${sourceHandle}`,
    source,
    target,
    sourceHandle,
    targetHandle: 'in',
  } as FlowEdge;
}

describe('listUpstreamVariables', () => {
  it('collects transitive ancestors with their output keys', () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    const search = createWorkflowNode('webSearch', { x: 1, y: 0 });
    const llm = createWorkflowNode('llm', { x: 2, y: 0 });
    const nodes = [input, search, llm];
    const edges = [makeEdge(input.id, search.id), makeEdge(search.id, llm.id)];

    const options = listUpstreamVariables(llm.id, nodes, edges);
    const selectors = options.map((option) => option.selector);

    expect(selectors).toContain(`${input.id}.text`);
    expect(selectors).toContain(`${search.id}.text`);
    expect(selectors).toContain(`${search.id}.results`);
    expect(selectors).not.toContain(`${llm.id}.text`);
  });

  it('excludes nodes that are not upstream', () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    const llm = createWorkflowNode('llm', { x: 1, y: 0 });
    const stranger = createWorkflowNode('webSearch', { x: 0, y: 1 });
    const edges = [makeEdge(input.id, llm.id)];

    const options = listUpstreamVariables(llm.id, [input, llm, stranger], edges);

    expect(options.every((option) => option.nodeId !== stranger.id)).toBe(true);
  });

  it('returns an empty list for entry nodes', () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    expect(listUpstreamVariables(input.id, [input], [])).toEqual([]);
  });
});
