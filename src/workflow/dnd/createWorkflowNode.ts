import type { FlowNode, NodeData } from '@/lib/types';
import { createId } from '@/lib/id';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import { DEFAULT_CODE_SNIPPET, type WorkflowNodeData } from '../nodes/workflowNodeData';

const DEFAULT_LABELS: Record<WorkflowNodeKind, string> = {
  textInput: 'Text Input',
  llm: 'LLM Call',
  webSearch: 'Web Search',
  knowledgeRetrieval: 'Knowledge Retrieval',
  ifElse: 'If / Else',
  code: 'Code',
  output: 'Output',
};

const DEFAULT_DATA: Partial<Record<WorkflowNodeKind, Partial<WorkflowNodeData>>> = {
  textInput: { text: '' },
  llm: { prompt: '' },
  webSearch: { query: '' },
  knowledgeRetrieval: { knowledgeTopK: 3 },
  ifElse: { conditionLogic: 'and', conditions: [] },
  code: { code: DEFAULT_CODE_SNIPPET },
};

export function createWorkflowNode(
  kind: WorkflowNodeKind,
  position: { x: number; y: number },
  label?: string
): FlowNode {
  const data: WorkflowNodeData = {
    kind,
    label: label ?? DEFAULT_LABELS[kind],
    ...DEFAULT_DATA[kind],
  };

  return {
    id: createId(`wf-${kind}`),
    type: kind,
    position,
    data: data as NodeData,
    selected: true,
  };
}
