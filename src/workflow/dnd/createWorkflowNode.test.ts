import { describe, expect, it } from 'vitest';
import { createWorkflowNode } from './createWorkflowNode';

describe('createWorkflowNode', () => {
  it('creates nodes for each workflow kind', () => {
    const kinds = ['textInput', 'llm', 'webSearch', 'output'] as const;
    for (const kind of kinds) {
      const node = createWorkflowNode(kind, { x: 10, y: 20 });
      expect(node.type).toBe(kind);
      expect(node.position).toEqual({ x: 10, y: 20 });
      expect(node.data.kind).toBe(kind);
    }
  });
});
