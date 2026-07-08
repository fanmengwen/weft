import type { Connection } from '@xyflow/react';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';

function getNodeKind(node: FlowNode | undefined): WorkflowNodeData['kind'] | undefined {
  const data = node?.data as unknown as WorkflowNodeData | undefined;
  return data?.kind;
}

function isDuplicateConnection(connection: Connection, edges: FlowEdge[]): boolean {
  return edges.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
  );
}

function wouldCreateCycle(edges: FlowEdge[], candidate: Connection): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }
  const list = adjacency.get(candidate.source!) ?? [];
  list.push(candidate.target!);
  adjacency.set(candidate.source!, list);
  return hasPath(adjacency, candidate.target!, candidate.source!);
}

function hasPath(adjacency: Map<string, string[]>, from: string, to: string): boolean {
  const visited = new Set<string>();
  const stack = [from];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === to) {
      return true;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    for (const next of adjacency.get(current) ?? []) {
      stack.push(next);
    }
  }
  return false;
}

export function isValidWorkflowConnection(
  connection: Connection,
  nodes: FlowNode[],
  edges: FlowEdge[]
): boolean {
  if (!connection.source || !connection.target) {
    return false;
  }
  if (connection.source === connection.target) {
    return false;
  }
  if (isDuplicateConnection(connection, edges)) {
    return false;
  }

  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);
  if (!sourceNode || !targetNode) {
    return false;
  }

  const sourceKind = getNodeKind(sourceNode);
  const targetKind = getNodeKind(targetNode);
  if (sourceKind === 'output' || targetKind === 'textInput') {
    return false;
  }

  // ifElse fans out through its named branch handles (one edge each);
  // every other node keeps the single outgoing edge of a linear chain.
  if (sourceKind === 'ifElse') {
    const handle = connection.sourceHandle;
    if (handle !== 'true' && handle !== 'false') {
      return false;
    }
    const handleTaken = edges.some(
      (edge) => edge.source === connection.source && edge.sourceHandle === handle
    );
    if (handleTaken) {
      return false;
    }
  } else {
    const outgoingCount = edges.filter((edge) => edge.source === connection.source).length;
    if (outgoingCount >= 1) {
      return false;
    }
  }

  const incomingCount = edges.filter((edge) => edge.target === connection.target).length;
  if (incomingCount >= 1) {
    return false;
  }

  if (wouldCreateCycle(edges, connection)) {
    return false;
  }

  return true;
}
