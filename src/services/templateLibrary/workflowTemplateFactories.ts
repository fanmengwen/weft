import { createDefaultEdge } from '@/constants';
import type { FlowEdge, FlowNode, NodeData } from '@/lib/types';
import type { WorkflowNodeKind } from '@/workflow/nodes/nodeCatalog';
import type { WorkflowNodeData } from '@/workflow/nodes/workflowNodeData';
import type { TemplateManifest } from './types';

/** Matches `WorkflowNodeShell` card width (`w-[236px]`). */
export const WORKFLOW_TEMPLATE_NODE_WIDTH = 236;

/**
 * Conservative card height for layout checks (header row; LLM footer is taller).
 * Template positions should leave ≥ WORKFLOW_TEMPLATE_MIN_GAP between these boxes.
 */
export const WORKFLOW_TEMPLATE_NODE_HEIGHT_EST = 90;

/** Minimum free space between card AABBs (breathing room). */
export const WORKFLOW_TEMPLATE_MIN_GAP = 56;

export function createWorkflowTemplateNode(
  id: string,
  kind: WorkflowNodeKind,
  label: string,
  x: number,
  y: number,
  data: Partial<Omit<WorkflowNodeData, 'kind' | 'label'>> = {}
): FlowNode {
  const nodeData: WorkflowNodeData = {
    kind,
    label,
    ...data,
  };
  return {
    id,
    type: kind,
    position: { x, y },
    data: nodeData as NodeData,
  };
}

export function createWorkflowTemplateEdge(
  source: string,
  target: string,
  options?: {
    label?: string;
    sourceHandle?: string;
    targetHandle?: string;
    id?: string;
  }
): FlowEdge {
  const edge = createDefaultEdge(source, target, options?.label, options?.id);
  return {
    ...edge,
    sourceHandle: options?.sourceHandle ?? 'out',
    targetHandle: options?.targetHandle ?? 'in',
  };
}

export function createWorkflowTemplate(
  id: string,
  name: string,
  description: string,
  tags: string[],
  nodes: FlowNode[],
  edges: FlowEdge[],
  metadata: Pick<
    TemplateManifest,
    | 'audience'
    | 'useCase'
    | 'launchPriority'
    | 'featured'
    | 'difficulty'
    | 'outcome'
    | 'replacementHints'
  >
): TemplateManifest {
  return {
    id,
    name,
    description,
    category: 'workflow',
    tags: ['workflow', '工作流', ...tags],
    graph: { nodes, edges },
    ...metadata,
  };
}
