import type { WorkflowNodeKind } from './nodeCatalog';

export type WorkflowConditionOperator = 'contains' | 'notContains' | 'equals' | 'regex';

export interface WorkflowCondition extends Record<string, unknown> {
  id: string;
  // "nodeId.key" selector into the variable pool; empty means the direct
  // upstream text.
  variable: string;
  operator: WorkflowConditionOperator;
  value: string;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  kind: WorkflowNodeKind;
  label: string;
  text?: string;
  prompt?: string;
  systemPrompt?: string;
  // Optional override; blank follows the global AI settings model.
  model?: string;
  query?: string;
  knowledgeDocId?: string;
  knowledgeTopK?: number;
  conditionLogic?: 'and' | 'or';
  conditions?: WorkflowCondition[];
  code?: string;
}

export const DEFAULT_CODE_SNIPPET = '// inputs.text holds the upstream text\nreturn inputs.text;';
