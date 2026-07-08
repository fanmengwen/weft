import { describe, expect, it } from 'vitest';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { isValidWorkflowConnection } from './workflowConnectionRules';

function node(id: string, kind: string): FlowNode {
  return {
    id,
    type: kind,
    position: { x: 0, y: 0 },
    data: { kind, label: id },
  };
}

describe('isValidWorkflowConnection', () => {
  const nodes = [
    node('a', 'textInput'),
    node('b', 'llm'),
    node('c', 'output'),
  ];

  it('allows a linear connection', () => {
    expect(
      isValidWorkflowConnection({ source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' }, nodes, [])
    ).toBe(true);
  });

  it('rejects self loops', () => {
    expect(
      isValidWorkflowConnection({ source: 'a', target: 'a', sourceHandle: 'out', targetHandle: 'in' }, nodes, [])
    ).toBe(false);
  });

  it('rejects forked outgoing edges', () => {
    const edges: FlowEdge[] = [
      { id: 'e1', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' },
    ];
    expect(
      isValidWorkflowConnection({ source: 'a', target: 'c', sourceHandle: 'out', targetHandle: 'in' }, nodes, edges)
    ).toBe(false);
  });

  it('rejects cycles', () => {
    const edges: FlowEdge[] = [
      { id: 'e1', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' },
      { id: 'e2', source: 'b', target: 'c', sourceHandle: 'out', targetHandle: 'in' },
    ];
    const cycleNodes = [...nodes, node('d', 'llm')];
    expect(
      isValidWorkflowConnection({ source: 'c', target: 'a', sourceHandle: 'out', targetHandle: 'in' }, cycleNodes, edges)
    ).toBe(false);
  });

  it('rejects connections into textInput', () => {
    expect(
      isValidWorkflowConnection({ source: 'b', target: 'a', sourceHandle: 'out', targetHandle: 'in' }, nodes, [])
    ).toBe(false);
  });

  describe('ifElse branching', () => {
    const branchNodes = [
      node('a', 'textInput'),
      node('cond', 'ifElse'),
      node('x', 'output'),
      node('y', 'output'),
    ];

    it('allows one edge per branch handle', () => {
      const edges: FlowEdge[] = [
        { id: 'e1', source: 'cond', target: 'x', sourceHandle: 'true', targetHandle: 'in' },
      ];
      expect(
        isValidWorkflowConnection(
          { source: 'cond', target: 'y', sourceHandle: 'false', targetHandle: 'in' },
          branchNodes,
          edges
        )
      ).toBe(true);
    });

    it('rejects a second edge on the same branch handle', () => {
      const edges: FlowEdge[] = [
        { id: 'e1', source: 'cond', target: 'x', sourceHandle: 'true', targetHandle: 'in' },
      ];
      expect(
        isValidWorkflowConnection(
          { source: 'cond', target: 'y', sourceHandle: 'true', targetHandle: 'in' },
          branchNodes,
          edges
        )
      ).toBe(false);
    });

    it('rejects ifElse connections from unnamed handles', () => {
      expect(
        isValidWorkflowConnection(
          { source: 'cond', target: 'x', sourceHandle: 'out', targetHandle: 'in' },
          branchNodes,
          []
        )
      ).toBe(false);
    });
  });
});
