import type { FlowEdge, FlowNode } from '@/lib/types';

interface SimplifiedNode {
  id: string;
  type?: string;
  label?: string;
  subLabel?: string;
  x: number;
  y: number;
}

interface ContextGraphPayload {
  nodes: SimplifiedNode[];
  edges: Array<{
    source: string;
    target: string;
    label?: string;
  }>;
  summary: {
    nodeCount: number;
    edgeCount: number;
    nodeTypes: Record<string, number>;
  };
}

function simplifyNodes(nodes: FlowNode[]): SimplifiedNode[] {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    label: node.data.label,
    subLabel: typeof node.data.subLabel === 'string' ? node.data.subLabel : undefined,
    x: node.position.x,
    y: node.position.y,
  }));
}

function summarizeNodeTypes(nodes: FlowNode[]): Record<string, number> {
  return nodes.reduce<Record<string, number>>((acc, node) => {
    const type = node.type ?? 'unknown';
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});
}

export function serializeCanvasContextForAI(nodes: FlowNode[], edges: FlowEdge[]): string {
  const payload: ContextGraphPayload = {
    nodes: simplifyNodes(nodes),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === 'string' ? edge.label : undefined,
    })),
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes: summarizeNodeTypes(nodes),
    },
  };

  return JSON.stringify(payload);
}
