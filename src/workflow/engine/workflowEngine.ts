import type { FlowEdge, FlowNode } from '@/lib/types';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';
import { getWorkflowHandler } from '../handlers/registry';
import { buildExecutionGraph } from './graphBuilder';
import {
  WorkflowHandlerError,
  type WorkflowMessage,
  type WorkflowNodeHandler,
  type WorkflowRunEvent,
} from './types';
import { VariablePool } from './variablePool';

export interface WorkflowRunInput {
  nodes: FlowNode[];
  edges: FlowEdge[];
  signal: AbortSignal;
}

export interface WorkflowRunOptions {
  // Test seam: lets engine tests swap handlers without touching the registry.
  resolveHandler?: (kind: WorkflowNodeKind) => WorkflowNodeHandler;
  // Seeds the pool with previous outputs (used by single-node test runs).
  initialOutputs?: Record<string, Record<string, unknown>>;
}

// Handlers report progress through callbacks while the store consumes a
// `for await` stream, so a small buffered channel bridges the two worlds.
interface EventChannel {
  push: (event: WorkflowRunEvent) => void;
  close: () => void;
  iterate: () => AsyncGenerator<WorkflowRunEvent>;
}

function createEventChannel(): EventChannel {
  const buffer: WorkflowRunEvent[] = [];
  let notify: (() => void) | null = null;
  let closed = false;

  return {
    push(event) {
      buffer.push(event);
      notify?.();
    },
    close() {
      closed = true;
      notify?.();
    },
    async *iterate() {
      while (true) {
        if (buffer.length > 0) {
          yield buffer.shift()!;
          continue;
        }
        if (closed) {
          return;
        }
        await new Promise<void>((resolve) => {
          notify = resolve;
        });
        notify = null;
      }
    },
  };
}

function getNodeData(node: FlowNode): WorkflowNodeData {
  return node.data as unknown as WorkflowNodeData;
}

function toWorkflowMessage(error: unknown): WorkflowMessage {
  if (error instanceof WorkflowHandlerError) {
    return { messageKey: error.messageKey, messageParams: error.messageParams };
  }
  if (error instanceof Error) {
    return { raw: error.message };
  }
  return { raw: String(error) };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function runWorkflow(
  input: WorkflowRunInput,
  options: WorkflowRunOptions = {}
): AsyncGenerator<WorkflowRunEvent> {
  const channel = createEventChannel();
  void executeWorkflow(input, options, channel.push).finally(() => channel.close());
  return channel.iterate();
}

async function executeWorkflow(
  input: WorkflowRunInput,
  options: WorkflowRunOptions,
  emit: (event: WorkflowRunEvent) => void
): Promise<void> {
  const { nodes, edges, signal } = input;
  const resolveHandler = options.resolveHandler ?? getWorkflowHandler;

  let graph;
  try {
    graph = buildExecutionGraph(nodes, edges);
  } catch (error) {
    emit({ type: 'runLog', log: { level: 'error', ...toWorkflowMessage(error) } });
    emit({ type: 'runFinished', status: 'failed', finalText: '' });
    return;
  }

  const pool = new VariablePool(options.initialOutputs);
  const deadReasonById = new Map<string, 'branchNotTaken' | 'upstreamDead'>();
  let anyFailed = false;

  emit({ type: 'runStarted', order: graph.order });

  for (const nodeId of graph.order) {
    if (signal.aborted) {
      emit({ type: 'runFinished', status: 'aborted', finalText: '' });
      return;
    }

    const node = graph.nodeById.get(nodeId)!;
    const data = getNodeData(node);
    const kind = data.kind;

    const markDownstreamDead = (
      reason: 'branchNotTaken' | 'upstreamDead',
      keepHandle?: string
    ) => {
      for (const edge of graph.outgoingEdgesById.get(nodeId) ?? []) {
        if (keepHandle !== undefined && edge.sourceHandle === keepHandle) {
          continue;
        }
        if (!deadReasonById.has(edge.target)) {
          deadReasonById.set(edge.target, reason);
        }
      }
    };

    const deadReason = deadReasonById.get(nodeId);
    if (deadReason) {
      emit({ type: 'nodeSkipped', nodeId, kind, reason: deadReason });
      markDownstreamDead('upstreamDead');
      continue;
    }

    emit({ type: 'nodeStarted', nodeId, kind });

    try {
      const handler = resolveHandler(kind);
      const result = await handler.run({
        node,
        data,
        pool,
        incomers: (graph.incomersById.get(nodeId) ?? [])
          .map((incomerId) => graph.nodeById.get(incomerId))
          .filter((incomer): incomer is FlowNode => Boolean(incomer)),
        signal,
        emitStream: (delta) => emit({ type: 'nodeStream', nodeId, delta }),
        log: (log) => emit({ type: 'nodeLog', nodeId, log }),
      });

      pool.setNodeOutputs(nodeId, result.outputs);
      emit({ type: 'nodeSucceeded', nodeId, kind, outputs: result.outputs });

      if (result.branch !== undefined) {
        markDownstreamDead('branchNotTaken', result.branch);
      }
    } catch (error) {
      if (signal.aborted || isAbortError(error)) {
        emit({ type: 'runFinished', status: 'aborted', finalText: '' });
        return;
      }
      anyFailed = true;
      emit({ type: 'nodeFailed', nodeId, kind, error: toWorkflowMessage(error) });
      markDownstreamDead('upstreamDead');
    }
  }

  const finalText = graph.order
    .filter((nodeId) => getNodeData(graph.nodeById.get(nodeId)!).kind === 'output')
    .map((nodeId) => pool.getNodeOutputs(nodeId)?.text)
    .filter((text): text is string => typeof text === 'string' && text.length > 0)
    .join('\n\n');

  emit({
    type: 'runFinished',
    status: anyFailed ? 'failed' : 'succeeded',
    finalText,
  });
}
