import type { WorkflowNodeKind } from './nodeCatalog';

export interface WorkflowNodeData extends Record<string, unknown> {
  kind: WorkflowNodeKind;
  label: string;
  text?: string;
  prompt?: string;
  model?: string;
  query?: string;
}

export const DEFAULT_LLM_MODEL = 'gpt-4o-mini';
