import type { FlowEdge, FlowNode } from '@/lib/types';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';

export type WorkflowValidationCode =
  | 'emptyGraph'
  | 'isolatedNode'
  | 'multipleIncoming'
  | 'cycle'
  | 'missingOutput';

export interface WorkflowValidationIssue {
  code: WorkflowValidationCode;
  nodeIds?: string[];
}

function getKind(node: FlowNode): WorkflowNodeData['kind'] | undefined {
  return (node.data as unknown as WorkflowNodeData | undefined)?.kind;
}

// Guards the invariants the engine relies on. The canvas connection rules
// already enforce them interactively; this re-checks before every run so
// imported JSON goes through the same gate.
export function validateWorkflowGraph(
  nodes: FlowNode[],
  edges: FlowEdge[]
): WorkflowValidationIssue[] {
  if (nodes.length === 0) {
    return [{ code: 'emptyGraph' }];
  }

  const issues: WorkflowValidationIssue[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const connectedIds = new Set<string>();
  const indegree = new Map<string, number>();

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      continue;
    }
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  if (nodes.length > 1) {
    const isolated = nodes.filter((node) => !connectedIds.has(node.id));
    if (isolated.length > 0) {
      issues.push({ code: 'isolatedNode', nodeIds: isolated.map((node) => node.id) });
    }
  }

  const multipleIncoming = nodes.filter((node) => (indegree.get(node.id) ?? 0) > 1);
  if (multipleIncoming.length > 0) {
    issues.push({ code: 'multipleIncoming', nodeIds: multipleIncoming.map((node) => node.id) });
  }

  if (hasCycle(nodes, edges)) {
    issues.push({ code: 'cycle' });
  }

  if (!nodes.some((node) => getKind(node) === 'output')) {
    issues.push({ code: 'missingOutput' });
  }

  return issues;
}

function hasCycle(nodes: FlowNode[], edges: FlowEdge[]): boolean {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }
  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) {
      continue;
    }
    adjacency.get(edge.source)!.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const queue = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  let visited = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    visited += 1;
    for (const next of adjacency.get(current) ?? []) {
      const remaining = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, remaining);
      if (remaining === 0) {
        queue.push(next);
      }
    }
  }
  return visited !== nodes.length;
}
