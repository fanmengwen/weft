import { describe, expect, it } from 'vitest';
import { createDefaultEdge } from '@/constants';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { parseWorkflowFile, serializeWorkflow } from './workflowFile';

describe('workflow file serialization', () => {
  it('round-trips a graph through export and import', () => {
    const input = createWorkflowNode('textInput', { x: 10, y: 20 });
    (input.data as { text?: string }).text = 'hello';
    const cond = createWorkflowNode('ifElse', { x: 200, y: 20 });
    const edge = createDefaultEdge(input.id, cond.id);
    edge.sourceHandle = 'out';
    edge.targetHandle = 'in';

    const raw = serializeWorkflow([input, cond], [edge]);
    const parsed = parseWorkflowFile(raw);

    expect(parsed.nodes).toHaveLength(2);
    expect(parsed.nodes[0]).toMatchObject({
      id: input.id,
      type: 'textInput',
      position: { x: 10, y: 20 },
      selected: false,
    });
    expect(parsed.nodes[0].data).toMatchObject({ kind: 'textInput', text: 'hello' });
    expect(parsed.edges).toHaveLength(1);
    expect(parsed.edges[0]).toMatchObject({
      id: edge.id,
      source: input.id,
      target: cond.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    // Imported edges regain the standard styling dropped from the export.
    expect(parsed.edges[0].type).toBe('smoothstep');
  });

  it('strips runtime props from the export', () => {
    const node = createWorkflowNode('llm', { x: 0, y: 0 });
    node.selected = true;
    const raw = serializeWorkflow([node], []);
    const file = JSON.parse(raw) as { nodes: Array<Record<string, unknown>> };

    expect(file.nodes[0].selected).toBeUndefined();
    expect(file.nodes[0].type).toBeUndefined();
  });

  it('rejects invalid JSON and wrong shapes', () => {
    expect(() => parseWorkflowFile('not json')).toThrow();
    expect(() => parseWorkflowFile('{}')).toThrow();
    expect(() =>
      parseWorkflowFile(JSON.stringify({ version: 99, nodes: [], edges: [] }))
    ).toThrow();
  });

  it('rejects unknown node kinds', () => {
    const raw = JSON.stringify({
      version: 1,
      nodes: [
        { id: 'n1', position: { x: 0, y: 0 }, data: { kind: 'teleport', label: 'Nope' } },
      ],
      edges: [],
    });
    expect(() => parseWorkflowFile(raw)).toThrow();
  });

  it('rejects edges pointing at missing nodes', () => {
    const raw = JSON.stringify({
      version: 1,
      nodes: [
        { id: 'n1', position: { x: 0, y: 0 }, data: { kind: 'textInput', label: 'In' } },
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'ghost' }],
    });
    expect(() => parseWorkflowFile(raw)).toThrow(/missing node/);
  });

  it('rejects duplicate node ids', () => {
    const node = { id: 'dup', position: { x: 0, y: 0 }, data: { kind: 'textInput', label: 'A' } };
    const raw = JSON.stringify({ version: 1, nodes: [node, node], edges: [] });
    expect(() => parseWorkflowFile(raw)).toThrow(/duplicate/);
  });
});
