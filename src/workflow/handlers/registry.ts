import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import type { WorkflowNodeHandler } from '../engine/types';
import { codeHandler } from './code';
import { ifElseHandler } from './ifElse';
import { knowledgeHandler } from './knowledge';
import { llmHandler } from './llm';
import { outputHandler } from './output';
import { textInputHandler } from './textInput';
import { webSearchHandler } from './webSearch';

// Dify keeps a NodeComponentMap per block type; this is the execution half of
// that idea. Adding a node kind = one catalog entry + one handler here.
const WORKFLOW_HANDLERS: Record<WorkflowNodeKind, WorkflowNodeHandler> = {
  textInput: textInputHandler,
  llm: llmHandler,
  webSearch: webSearchHandler,
  knowledgeRetrieval: knowledgeHandler,
  ifElse: ifElseHandler,
  code: codeHandler,
  output: outputHandler,
};

export function getWorkflowHandler(kind: WorkflowNodeKind): WorkflowNodeHandler {
  const handler = WORKFLOW_HANDLERS[kind];
  if (!handler) {
    throw new Error(`no workflow handler registered for node kind "${kind}"`);
  }
  return handler;
}
