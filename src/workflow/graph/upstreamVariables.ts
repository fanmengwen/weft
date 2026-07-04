import type { FlowEdge, FlowNode } from '@/lib/types';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';

// The standard output keys each node kind deposits into the VariablePool.
const OUTPUT_KEYS: Record<WorkflowNodeKind, string[]> = {
  textInput: ['text'],
  llm: ['text'],
  webSearch: ['text', 'results'],
  knowledgeRetrieval: ['text', 'chunks'],
  ifElse: ['result', 'text'],
  code: ['text', 'value'],
  output: ['text'],
};

export interface UpstreamVariableOption {
  selector: string;
  nodeId: string;
  nodeLabel: string;
  key: string;
}

// Everything transitively upstream of nodeId is referenceable — matching the
// pool, which retains outputs of every executed ancestor, not just parents.
export function listUpstreamVariables(
  nodeId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): UpstreamVariableOption[] {
  const incomersById = new Map<string, string[]>();
  for (const edge of edges) {
    const list = incomersById.get(edge.target) ?? [];
    list.push(edge.source);
    incomersById.set(edge.target, list);
  }

  const ancestors: string[] = [];
  const visited = new Set<string>([nodeId]);
  const queue = [...(incomersById.get(nodeId) ?? [])];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    ancestors.push(current);
    queue.push(...(incomersById.get(current) ?? []));
  }

  const options: UpstreamVariableOption[] = [];
  for (const ancestorId of ancestors) {
    const node = nodes.find((entry) => entry.id === ancestorId);
    if (!node) {
      continue;
    }
    const data = node.data as unknown as WorkflowNodeData;
    for (const key of OUTPUT_KEYS[data.kind] ?? []) {
      options.push({
        selector: `${ancestorId}.${key}`,
        nodeId: ancestorId,
        nodeLabel: data.label,
        key,
      });
    }
  }
  return options;
}
