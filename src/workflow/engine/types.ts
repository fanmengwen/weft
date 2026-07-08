import type { FlowNode } from '@/lib/types';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';
import type { VariablePool } from './variablePool';

export type NodeRunStatus = 'idle' | 'running' | 'succeeded' | 'failed' | 'skipped';

export type WorkflowRunStatus = 'idle' | 'running' | 'succeeded' | 'failed' | 'aborted';

export type WorkflowLogLevel = 'info' | 'warn' | 'error';

// Log/error payloads carry either an i18n key (resolved by the UI at render
// time, so logs follow the active language) or raw text for pass-through
// content such as provider errors and streamed model output.
export interface WorkflowMessage {
  messageKey?: string;
  messageParams?: Record<string, string | number>;
  raw?: string;
}

export interface WorkflowLogMessage extends WorkflowMessage {
  level: WorkflowLogLevel;
}

export type WorkflowRunEvent =
  | { type: 'runStarted'; order: string[] }
  | { type: 'runLog'; log: WorkflowLogMessage }
  | { type: 'nodeStarted'; nodeId: string; kind: WorkflowNodeKind }
  | { type: 'nodeStream'; nodeId: string; delta: string }
  | { type: 'nodeLog'; nodeId: string; log: WorkflowLogMessage }
  | {
      type: 'nodeSucceeded';
      nodeId: string;
      kind: WorkflowNodeKind;
      outputs: Record<string, unknown>;
    }
  | { type: 'nodeFailed'; nodeId: string; kind: WorkflowNodeKind; error: WorkflowMessage }
  | {
      type: 'nodeSkipped';
      nodeId: string;
      kind: WorkflowNodeKind;
      reason: 'branchNotTaken' | 'upstreamDead';
    }
  | { type: 'runFinished'; status: 'succeeded' | 'failed' | 'aborted'; finalText: string };

export interface NodeRunResult {
  outputs: Record<string, unknown>;
  // Branching nodes name the source handle whose outgoing edges stay alive;
  // targets hanging off every other handle get skipped.
  branch?: string;
}

export interface WorkflowRunContext {
  node: FlowNode;
  data: WorkflowNodeData;
  pool: VariablePool;
  incomers: FlowNode[];
  signal: AbortSignal;
  emitStream: (delta: string) => void;
  log: (log: WorkflowLogMessage) => void;
}

export interface WorkflowNodeHandler {
  run: (context: WorkflowRunContext) => Promise<NodeRunResult>;
}

// Thrown by handlers for failures we phrase ourselves (as opposed to errors
// bubbling up from fetch/provider SDKs, which stay raw).
export class WorkflowHandlerError extends Error {
  readonly messageKey: string;
  readonly messageParams?: Record<string, string | number>;

  constructor(messageKey: string, messageParams?: Record<string, string | number>) {
    super(messageKey);
    this.name = 'WorkflowHandlerError';
    this.messageKey = messageKey;
    this.messageParams = messageParams;
  }
}
