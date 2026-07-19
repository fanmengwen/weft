import { create } from 'zustand';
import { createId } from '@/lib/id';
import { useFlowStore } from '@/store';
import {
  WorkflowHandlerError,
  type NodeRunStatus,
  type WorkflowLogMessage,
  type WorkflowRunEvent,
  type WorkflowRunStatus,
} from '../engine/types';
import { validateWorkflowGraph } from '../engine/graphValidator';
import { VariablePool } from '../engine/variablePool';
import { runWorkflow } from '../engine/workflowEngine';
import { getWorkflowHandler } from '../handlers/registry';
import { useWorkflowRunHistoryStore } from '../history/workflowRunHistoryStore';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';
import { useWorkflowStore } from './workflowStore';

export interface WorkflowLogEntry extends WorkflowLogMessage {
  id: string;
  ts: number;
  nodeId?: string;
  nodeLabel?: string;
  // Stream entries accumulate LLM deltas in place instead of one entry per token.
  stream?: boolean;
}

interface WorkflowRunState {
  runStatus: WorkflowRunStatus;
  nodeRunStates: Record<string, NodeRunStatus>;
  logEntries: WorkflowLogEntry[];
  // Last successful outputs per node, kept across runs so single-node test
  // runs can replay upstream variables (Dify's DraftVarLoader, simplified).
  lastRunOutputs: Record<string, Record<string, unknown>>;
  finalOutput: string | null;
  isOutputModalOpen: boolean;
  isLogOpen: boolean;
  startRun: () => Promise<boolean>;
  // Dify's one-step run: executes a single handler against variables cached
  // from previous runs instead of re-running the whole graph.
  runSingleNode: (nodeId: string) => Promise<void>;
  stopRun: () => void;
  closeOutputModal: () => void;
  toggleLogOpen: () => void;
  clearLog: () => void;
  // Drops per-node state after the graph itself changes (e.g. JSON import).
  clearRunState: () => void;
}

// The controller lives outside zustand state: it is not renderable data and
// replacing it must never trigger subscribers.
let activeController: AbortController | null = null;

function nodeLabel(nodeId: string): string {
  const node = useWorkflowStore.getState().workflowNodes.find((entry) => entry.id === nodeId);
  return (node?.data as unknown as WorkflowNodeData | undefined)?.label ?? nodeId;
}

function makeEntry(log: WorkflowLogMessage, nodeId?: string): WorkflowLogEntry {
  return {
    id: createId('wf-log'),
    ts: Date.now(),
    nodeId,
    nodeLabel: nodeId ? nodeLabel(nodeId) : undefined,
    ...log,
  };
}

interface RunDocumentSnapshot {
  id: string;
  name: string;
  inputSummary?: string;
  nodeSnapshots: Record<
    string,
    {
      label: string;
      kind: WorkflowNodeKind;
      inputSnapshot?: string;
    }
  >;
}

function workflowNodeKind(value: unknown): WorkflowNodeKind | null {
  switch (value) {
    case 'textInput':
    case 'llm':
    case 'webSearch':
    case 'knowledgeRetrieval':
    case 'ifElse':
    case 'code':
    case 'output':
      return value;
    default:
      return null;
  }
}

function inputSnapshot(kind: WorkflowNodeKind, data: Record<string, unknown>): string | undefined {
  const field = kind === 'llm' ? 'prompt' : kind === 'webSearch' ? 'query' : kind === 'code' ? 'code' : 'text';
  const value = data[field];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (kind === 'ifElse' && Array.isArray(data.conditions)) {
    return JSON.stringify(data.conditions, null, 2);
  }
  return undefined;
}

function serializeSnapshot(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  try {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    return text.length > 6000 ? `${text.slice(0, 6000)}\n…` : text;
  } catch {
    return String(value);
  }
}

function currentDocumentSnapshot(): RunDocumentSnapshot {
  const state = useFlowStore.getState();
  const document = state.documents.find((entry) => entry.id === state.activeDocumentId);
  const nodeSnapshots: RunDocumentSnapshot['nodeSnapshots'] = {};
  let inputSummary: string | undefined;
  for (const node of useWorkflowStore.getState().workflowNodes) {
    const kind = workflowNodeKind(node.data.kind);
    if (!kind) {
      continue;
    }
    const snapshot = inputSnapshot(kind, node.data);
    nodeSnapshots[node.id] = { label: node.data.label, kind, inputSnapshot: snapshot };
    if (!inputSummary && kind === 'textInput') {
      inputSummary = snapshot;
    }
  }
  return {
    id: document?.id ?? state.activeDocumentId,
    name: document?.name ?? '未命名工作流',
    inputSummary,
    nodeSnapshots,
  };
}

function isTerminalStatus(
  status: WorkflowRunStatus
): status is 'succeeded' | 'failed' | 'aborted' {
  return status === 'succeeded' || status === 'failed' || status === 'aborted';
}

export const useWorkflowRunStore = create<WorkflowRunState>()((set, get) => {
  const appendLog = (log: WorkflowLogMessage, nodeId?: string) =>
    set((state) => ({ logEntries: [...state.logEntries, makeEntry(log, nodeId)] }));

  const setNodeState = (nodeId: string, status: NodeRunStatus) =>
    set((state) => ({ nodeRunStates: { ...state.nodeRunStates, [nodeId]: status } }));

  const appendStreamDelta = (nodeId: string, delta: string) =>
    set((state) => {
      const entries = [...state.logEntries];
      let index = -1;
      for (let i = entries.length - 1; i >= 0; i -= 1) {
        if (entries[i].stream && entries[i].nodeId === nodeId) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        entries[index] = { ...entries[index], raw: (entries[index].raw ?? '') + delta };
        return { logEntries: entries };
      }
      return {
        logEntries: [
          ...entries,
          { ...makeEntry({ level: 'info', raw: delta }, nodeId), stream: true },
        ],
      };
    });

  const saveRunRecord = (startedAt: number, document: RunDocumentSnapshot) => {
    const state = get();
    if (!isTerminalStatus(state.runStatus)) {
      return;
    }
    const finishedAt = Date.now();
    const nodeSnapshots = Object.fromEntries(
      Object.entries(document.nodeSnapshots).map(([nodeId, snapshot]) => [
        nodeId,
        {
          ...snapshot,
          outputSnapshot: serializeSnapshot(state.lastRunOutputs[nodeId]),
        },
      ])
    );
    useWorkflowRunHistoryStore.getState().addRecord({
      id: createId('wf-run'),
      documentId: document.id,
      documentName: document.name,
      status: state.runStatus,
      startedAt,
      finishedAt,
      durationMs: Math.max(0, finishedAt - startedAt),
      inputSummary: document.inputSummary,
      finalOutput: state.finalOutput ?? '',
      nodeRunStates: { ...state.nodeRunStates },
      nodeSnapshots,
      logEntries: state.logEntries.map((entry) => ({ ...entry })),
    });
  };

  const applyEvent = (event: WorkflowRunEvent) => {
    switch (event.type) {
      case 'runStarted':
        set({
          nodeRunStates: Object.fromEntries(event.order.map((nodeId) => [nodeId, 'idle'])),
        });
        appendLog({ level: 'info', messageKey: 'workflowMode.log.runStarted' });
        break;
      case 'runLog':
        appendLog(event.log);
        break;
      case 'nodeStarted':
        setNodeState(event.nodeId, 'running');
        appendLog(
          {
            level: 'info',
            messageKey: 'workflowMode.log.nodeStarted',
            messageParams: { label: nodeLabel(event.nodeId) },
          },
          event.nodeId
        );
        break;
      case 'nodeStream':
        appendStreamDelta(event.nodeId, event.delta);
        break;
      case 'nodeLog':
        appendLog(event.log, event.nodeId);
        break;
      case 'nodeSucceeded':
        setNodeState(event.nodeId, 'succeeded');
        set((state) => ({
          lastRunOutputs: { ...state.lastRunOutputs, [event.nodeId]: event.outputs },
        }));
        appendLog(
          {
            level: 'info',
            messageKey: 'workflowMode.log.nodeSucceeded',
            messageParams: { label: nodeLabel(event.nodeId) },
          },
          event.nodeId
        );
        break;
      case 'nodeFailed':
        setNodeState(event.nodeId, 'failed');
        appendLog({ level: 'error', ...event.error }, event.nodeId);
        break;
      case 'nodeSkipped':
        setNodeState(event.nodeId, 'skipped');
        appendLog(
          {
            level: 'info',
            messageKey:
              event.reason === 'branchNotTaken'
                ? 'workflowMode.log.nodeSkippedBranch'
                : 'workflowMode.log.nodeSkippedUpstream',
            messageParams: { label: nodeLabel(event.nodeId) },
          },
          event.nodeId
        );
        break;
      case 'runFinished': {
        const statusKey =
          event.status === 'succeeded'
            ? 'workflowMode.log.runSucceeded'
            : event.status === 'aborted'
              ? 'workflowMode.log.runAborted'
              : 'workflowMode.log.runFailed';
        appendLog({ level: event.status === 'failed' ? 'error' : 'info', messageKey: statusKey });
        set((state) => ({
          runStatus: event.status,
          finalOutput: event.finalText || null,
          isOutputModalOpen: event.status === 'succeeded' && event.finalText.length > 0,
          // An aborted run leaves the in-flight node dangling in 'running'.
          nodeRunStates:
            event.status === 'aborted'
              ? Object.fromEntries(
                  Object.entries(state.nodeRunStates).map(([nodeId, status]) => [
                    nodeId,
                    status === 'running' ? 'idle' : status,
                  ])
                )
              : state.nodeRunStates,
        }));
        break;
      }
    }
  };

  return {
    runStatus: 'idle',
    nodeRunStates: {},
    logEntries: [],
    lastRunOutputs: {},
    finalOutput: null,
    isOutputModalOpen: false,
    isLogOpen: false,

    startRun: async () => {
      if (get().runStatus === 'running') {
        return false;
      }
      const { workflowNodes, workflowEdges } = useWorkflowStore.getState();
      const startedAt = Date.now();
      const document = currentDocumentSnapshot();

      set({
        runStatus: 'running',
        nodeRunStates: {},
        logEntries: [],
        finalOutput: null,
        isOutputModalOpen: false,
        isLogOpen: true,
      });

      const issues = validateWorkflowGraph(workflowNodes, workflowEdges);
      if (issues.length > 0) {
        for (const issue of issues) {
          appendLog({
            level: 'error',
            messageKey: `workflowMode.log.validation.${issue.code}`,
            messageParams: issue.nodeIds
              ? { labels: issue.nodeIds.map(nodeLabel).join(', ') }
              : undefined,
          });
        }
        set({ runStatus: 'failed' });
        saveRunRecord(startedAt, document);
        return false;
      }

      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        for await (const event of runWorkflow({
          nodes: workflowNodes,
          edges: workflowEdges,
          signal: controller.signal,
        })) {
          applyEvent(event);
        }
      } finally {
        if (activeController === controller) {
          activeController = null;
        }
      }
      saveRunRecord(startedAt, document);
      return true;
    },

    runSingleNode: async (nodeId) => {
      if (get().runStatus === 'running' || get().nodeRunStates[nodeId] === 'running') {
        return;
      }
      const { workflowNodes, workflowEdges } = useWorkflowStore.getState();
      const node = workflowNodes.find((entry) => entry.id === nodeId);
      if (!node) {
        return;
      }
      const data = node.data as unknown as WorkflowNodeData;
      const incomers = workflowEdges
        .filter((edge) => edge.target === nodeId)
        .map((edge) => workflowNodes.find((entry) => entry.id === edge.source))
        .filter((incomer): incomer is (typeof workflowNodes)[number] => Boolean(incomer));

      set({ isLogOpen: true });
      setNodeState(nodeId, 'running');
      appendLog(
        {
          level: 'info',
          messageKey: 'workflowMode.log.nodeStarted',
          messageParams: { label: nodeLabel(nodeId) },
        },
        nodeId
      );

      const missingUpstream = incomers.filter((incomer) => !get().lastRunOutputs[incomer.id]);
      if (missingUpstream.length > 0) {
        appendLog(
          {
            level: 'warn',
            messageKey: 'workflowMode.log.singleRunMissingUpstream',
            messageParams: {
              labels: missingUpstream.map((incomer) => nodeLabel(incomer.id)).join(', '),
            },
          },
          nodeId
        );
      }

      const controller = new AbortController();
      try {
        const handler = getWorkflowHandler(data.kind);
        const result = await handler.run({
          node,
          data,
          pool: new VariablePool(get().lastRunOutputs),
          incomers,
          signal: controller.signal,
          emitStream: (delta) => appendStreamDelta(nodeId, delta),
          log: (log) => appendLog(log, nodeId),
        });
        set((state) => ({
          lastRunOutputs: { ...state.lastRunOutputs, [nodeId]: result.outputs },
        }));
        setNodeState(nodeId, 'succeeded');
        appendLog(
          {
            level: 'info',
            messageKey: 'workflowMode.log.nodeSucceeded',
            messageParams: { label: nodeLabel(nodeId) },
          },
          nodeId
        );
      } catch (error) {
        setNodeState(nodeId, 'failed');
        appendLog(
          {
            level: 'error',
            ...(error instanceof WorkflowHandlerError
              ? { messageKey: error.messageKey, messageParams: error.messageParams }
              : { raw: error instanceof Error ? error.message : String(error) }),
          },
          nodeId
        );
      }
    },

    stopRun: () => {
      activeController?.abort();
    },

    closeOutputModal: () => set({ isOutputModalOpen: false }),

    toggleLogOpen: () => set((state) => ({ isLogOpen: !state.isLogOpen })),

    clearLog: () => set({ logEntries: [] }),

    clearRunState: () =>
      set({
        runStatus: 'idle',
        nodeRunStates: {},
        logEntries: [],
        lastRunOutputs: {},
        finalOutput: null,
        isOutputModalOpen: false,
        isLogOpen: false,
      }),
  };
});
