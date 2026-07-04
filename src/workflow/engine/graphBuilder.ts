import type { FlowEdge, FlowNode } from '@/lib/types';

export interface ExecutionGraph {
  // Topological order over the whole graph; disconnected chains all appear,
  // interleaved deterministically by node insertion order.
  order: string[];
  nodeById: Map<string, FlowNode>;
  incomersById: Map<string, string[]>;
  outgoingEdgesById: Map<string, FlowEdge[]>;
}

// Kahn topological sort. Callers are expected to run validateWorkflowGraph
// first; a cycle here is a programming error, not a user-facing state.
export function buildExecutionGraph(nodes: FlowNode[], edges: FlowEdge[]): ExecutionGraph {
  const nodeById = new Map<string, FlowNode>();
  const incomersById = new Map<string, string[]>();
  const outgoingEdgesById = new Map<string, FlowEdge[]>();
  const indegree = new Map<string, number>();

  for (const node of nodes) {
    nodeById.set(node.id, node);
    incomersById.set(node.id, []);
    outgoingEdgesById.set(node.id, []);
    indegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) {
      continue;
    }
    incomersById.get(edge.target)!.push(edge.source);
    outgoingEdgesById.get(edge.source)!.push(edge);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const queue = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  const order: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    order.push(nodeId);
    for (const edge of outgoingEdgesById.get(nodeId) ?? []) {
      const remaining = (indegree.get(edge.target) ?? 0) - 1;
      indegree.set(edge.target, remaining);
      if (remaining === 0) {
        queue.push(edge.target);
      }
    }
  }

  if (order.length !== nodes.length) {
    throw new Error('workflow graph contains a cycle');
  }

  return { order, nodeById, incomersById, outgoingEdgesById };
}
