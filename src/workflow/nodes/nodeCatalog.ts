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
  category: WorkflowNodeCategory;
  tone: WorkflowNodeTone;
}

export const WORKFLOW_NODE_CATALOG: ReadonlyArray<WorkflowNodeMeta> = [
  { kind: 'textInput', category: 'input', tone: 'input' },
  { kind: 'llm', category: 'process', tone: 'llm' },
  { kind: 'webSearch', category: 'process', tone: 'web' },
  { kind: 'knowledgeRetrieval', category: 'process', tone: 'kb' },
  { kind: 'ifElse', category: 'logic', tone: 'cond' },
  { kind: 'code', category: 'process', tone: 'code' },
  { kind: 'output', category: 'output', tone: 'out' },
];

/** Library display order: sections and the kinds inside each. */
export const WORKFLOW_NODE_CATEGORIES: ReadonlyArray<{
  id: WorkflowNodeCategory;
  kinds: ReadonlyArray<WorkflowNodeKind>;
}> = [
  { id: 'input', kinds: ['textInput'] },
  { id: 'process', kinds: ['llm', 'webSearch', 'knowledgeRetrieval', 'code'] },
  { id: 'logic', kinds: ['ifElse'] },
  { id: 'output', kinds: ['output'] },
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
