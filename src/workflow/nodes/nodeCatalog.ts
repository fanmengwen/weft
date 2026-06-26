export type WorkflowNodeKind = 'textInput' | 'llm' | 'webSearch' | 'output';

export interface WorkflowNodeMeta {
  kind: WorkflowNodeKind;
  icon: string;
  accent: string;
}

export const WORKFLOW_NODE_CATALOG: ReadonlyArray<WorkflowNodeMeta> = [
  { kind: 'textInput', icon: '📝', accent: '#3b82f6' },
  { kind: 'llm', icon: '🤖', accent: '#8b5cf6' },
  { kind: 'webSearch', icon: '🔍', accent: '#14b8a6' },
  { kind: 'output', icon: '📤', accent: '#f59e0b' },
];
