import type { FlowNode, NodeData } from '@/lib/types';
import { createId } from '@/lib/id';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import { DEFAULT_LLM_MODEL, type WorkflowNodeData } from '../nodes/workflowNodeData';

const DEFAULT_LABELS: Record<WorkflowNodeKind, string> = {
  textInput: 'Text Input',
  llm: 'LLM Call',
  webSearch: 'Web Search',
  output: 'Output',
};

export function createWorkflowNode(
  kind: WorkflowNodeKind,
  position: { x: number; y: number },
  label?: string
): FlowNode {
  const data: WorkflowNodeData = {
    kind,
    label: label ?? DEFAULT_LABELS[kind],
    ...(kind === 'llm' ? { model: DEFAULT_LLM_MODEL, prompt: '' } : {}),
    ...(kind === 'textInput' ? { text: '' } : {}),
    ...(kind === 'webSearch' ? { query: '' } : {}),
  };

  return {
    id: createId(`wf-${kind}`),
    type: kind,
    position,
    data: data as NodeData,
    selected: true,
  };
}
