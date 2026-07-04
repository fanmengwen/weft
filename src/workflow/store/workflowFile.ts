import { z } from 'zod';
import { createDefaultEdge } from '@/constants';
import type { FlowEdge, FlowNode, NodeData } from '@/lib/types';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';

export const WORKFLOW_FILE_VERSION = 1;

const WORKFLOW_KINDS = [
  'textInput',
  'llm',
  'webSearch',
  'knowledgeRetrieval',
  'ifElse',
  'code',
  'output',
] as const;

const workflowNodeSchema = z.object({
  id: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z
    .object({
      kind: z.enum(WORKFLOW_KINDS),
      label: z.string(),
    })
    .catchall(z.unknown()),
});

const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

const workflowFileSchema = z.object({
  version: z.literal(WORKFLOW_FILE_VERSION),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

export type WorkflowFile = z.infer<typeof workflowFileSchema>;

// The export is the minimal editable shape — graph structure and node config
// only, none of React Flow's runtime props (selected, measured sizes, edge
// styling), which get rebuilt on import.
export function serializeWorkflow(nodes: FlowNode[], edges: FlowEdge[]): string {
  const file: WorkflowFile = {
    version: WORKFLOW_FILE_VERSION,
    nodes: nodes.map((node) => ({
      id: node.id,
      position: { x: node.position.x, y: node.position.y },
      data: node.data as unknown as WorkflowFile['nodes'][number]['data'],
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
    })),
  };
  return JSON.stringify(file, null, 2);
}

export function parseWorkflowFile(raw: string): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const file = workflowFileSchema.parse(JSON.parse(raw));

  const nodeIds = new Set(file.nodes.map((node) => node.id));
  if (nodeIds.size !== file.nodes.length) {
    throw new Error('workflow file contains duplicate node ids');
  }
  for (const edge of file.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error('workflow file contains an edge pointing at a missing node');
    }
  }

  const nodes: FlowNode[] = file.nodes.map((node) => ({
    id: node.id,
    type: node.data.kind,
    // zod guarantees numbers at runtime; the ?? only appeases inference,
    // which sees every prop as optional with this tsconfig.
    position: { x: node.position.x ?? 0, y: node.position.y ?? 0 },
    data: node.data as WorkflowNodeData as NodeData,
    selected: false,
  }));

  const edges: FlowEdge[] = file.edges.map((edge) => {
    const rebuilt = createDefaultEdge(edge.source, edge.target, undefined, edge.id);
    rebuilt.sourceHandle = edge.sourceHandle ?? 'out';
    rebuilt.targetHandle = edge.targetHandle ?? 'in';
    return rebuilt;
  });

  return { nodes, edges };
}
