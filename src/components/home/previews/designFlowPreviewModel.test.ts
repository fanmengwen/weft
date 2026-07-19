import { describe, expect, it } from 'vitest';
import { NodeType, type FlowEdge, type FlowNode } from '@/lib/types';
import {
  graphFromFlowNodes,
  kindFromNodeType,
  toneFromNodeType,
} from './designFlowPreviewModel';

function node(
  id: string,
  type: string,
  label: string,
  x: number,
  y: number
): FlowNode {
  return {
    id,
    type,
    position: { x, y },
    data: { label, color: 'blue' },
  };
}

describe('designFlowPreviewModel', () => {
  it('maps tones / kinds and drops annotations', () => {
    expect(toneFromNodeType(NodeType.START)).toBe('start');
    expect(toneFromNodeType('llm')).toBe('llm');
    expect(toneFromNodeType('knowledgeRetrieval')).toBe('kb');
    expect(kindFromNodeType(NodeType.DECISION, undefined)).toBe('diamond');
    expect(kindFromNodeType('ifElse', undefined)).toBe('rect');

    const nodes: FlowNode[] = [
      node('a', NodeType.START, '开始', 0, 0),
      node('b', NodeType.PROCESS, '处理', 120, 0),
      {
        id: 'note',
        type: NodeType.ANNOTATION,
        position: { x: 0, y: 80 },
        data: { label: '备注', color: 'yellow' },
      },
    ];
    const edges: FlowEdge[] = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'a', target: 'note' },
    ];

    const graph = graphFromFlowNodes(nodes, edges);
    expect(graph.nodes.map((entry) => entry.id)).toEqual(['a', 'b']);
    expect(graph.edges).toHaveLength(1);
    expect(graph.nodes[0]?.kind).toBe('capsule');
    expect(graph.nodes[1]?.kind).toBe('rect');
  });

  it('packs sparse graphs into a compact readable layout', () => {
    const nodes: FlowNode[] = [
      node('a', NodeType.START, '开始', 0, 0),
      node('b', NodeType.PROCESS, '提交申请', 0, 400),
      node('c', NodeType.DECISION, '通过?', 0, 900),
      node('d', NodeType.END, '结束', 0, 1400),
    ];
    const edges: FlowEdge[] = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c', label: '待审' },
      { id: 'e3', source: 'c', target: 'd', label: '是' },
    ];

    const graph = graphFromFlowNodes(nodes, edges);
    expect(graph.nodes).toHaveLength(4);
    // Compact layers keep total width far below the original 1400px span.
    const maxX = Math.max(...graph.nodes.map((entry) => entry.x + entry.width));
    const maxY = Math.max(...graph.nodes.map((entry) => entry.y + entry.height));
    expect(maxX).toBeLessThan(700);
    expect(maxY).toBeLessThan(280);
    expect(graph.nodes.every((entry) => entry.height >= 34 || entry.kind === 'diamond')).toBe(
      true
    );
    expect(graph.edges.some((edge) => edge.label === '是')).toBe(true);
  });
});
