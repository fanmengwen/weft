export type WorkflowNodeKind =
  | 'textInput'
  | 'llm'
  | 'webSearch'
  | 'knowledgeRetrieval'
  | 'ifElse'
  | 'code'
  | 'output';

export interface WorkflowNodeMeta {
  kind: WorkflowNodeKind;
  icon: string;
  accent: string;
}

export const WORKFLOW_NODE_CATALOG: ReadonlyArray<WorkflowNodeMeta> = [
  { kind: 'textInput', icon: '📝', accent: '#3b82f6' },
  { kind: 'llm', icon: '🤖', accent: '#8b5cf6' },
  { kind: 'webSearch', icon: '🔍', accent: '#14b8a6' },
  { kind: 'knowledgeRetrieval', icon: '📚', accent: '#ec4899' },
  { kind: 'ifElse', icon: '🔀', accent: '#f97316' },
  { kind: 'code', icon: '💻', accent: '#64748b' },
  { kind: 'output', icon: '📤', accent: '#f59e0b' },
];
