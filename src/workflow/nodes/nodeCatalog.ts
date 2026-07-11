import type React from 'react';

export type WorkflowNodeKind =
  | 'textInput'
  | 'llm'
  | 'webSearch'
  | 'knowledgeRetrieval'
  | 'ifElse'
  | 'code'
  | 'output';

export type WorkflowNodeCategory = 'input' | 'process' | 'logic' | 'output';

/** Token suffix of the --wf-t-<tone>-bg/fg CSS variable pair in index.css. */
export type WorkflowNodeTone = 'input' | 'llm' | 'web' | 'kb' | 'cond' | 'code' | 'out';

export interface WorkflowNodeMeta {
  kind: WorkflowNodeKind;
  icon: string;
  accent: string;
  category: WorkflowNodeCategory;
  tone: WorkflowNodeTone;
}

export const WORKFLOW_NODE_CATALOG: ReadonlyArray<WorkflowNodeMeta> = [
  { kind: 'textInput', icon: '📝', accent: '#3b82f6', category: 'input', tone: 'input' },
  { kind: 'llm', icon: '🤖', accent: '#8b5cf6', category: 'process', tone: 'llm' },
  { kind: 'webSearch', icon: '🔍', accent: '#14b8a6', category: 'process', tone: 'web' },
  { kind: 'knowledgeRetrieval', icon: '📚', accent: '#ec4899', category: 'process', tone: 'kb' },
  { kind: 'ifElse', icon: '🔀', accent: '#f97316', category: 'logic', tone: 'cond' },
  { kind: 'code', icon: '💻', accent: '#64748b', category: 'process', tone: 'code' },
  { kind: 'output', icon: '📤', accent: '#f59e0b', category: 'output', tone: 'out' },
];

export function workflowNodeTone(kind: WorkflowNodeKind): WorkflowNodeTone {
  return WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === kind)?.tone ?? 'code';
}

/** Inline style pair for the tone-tinted icon tile (dynamic var names can't be Tailwind classes). */
export function workflowToneStyle(tone: WorkflowNodeTone): React.CSSProperties {
  return {
    background: `var(--wf-t-${tone}-bg)`,
    color: `var(--wf-t-${tone}-fg)`,
  };
}
