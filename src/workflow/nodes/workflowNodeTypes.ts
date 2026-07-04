import type { NodeTypes } from '@/lib/reactflowCompat';
import { WorkflowNodeShell } from './WorkflowNodeShell';

export const workflowNodeTypes: NodeTypes = {
  textInput: WorkflowNodeShell,
  llm: WorkflowNodeShell,
  webSearch: WorkflowNodeShell,
  knowledgeRetrieval: WorkflowNodeShell,
  ifElse: WorkflowNodeShell,
  code: WorkflowNodeShell,
  output: WorkflowNodeShell,
};
