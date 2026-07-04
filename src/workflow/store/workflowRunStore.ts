import { create } from 'zustand';
import { createId } from '@/lib/id';
import type {
  NodeRunStatus,
  WorkflowLogMessage,
  WorkflowRunEvent,
  WorkflowRunStatus,
} from '../engine/types';
import { validateWorkflowGraph } from '../engine/graphValidator';
import { runWorkflow } from '../engine/workflowEngine';
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
  stopRun: () => void;
  closeOutputModal: () => void;
  toggleLogOpen: () => void;
  clearLog: () => void;
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

export const useWorkflowRunStore = create<WorkflowRunState>()((set, get) => {
  const appendLog = (log: WorkflowLogMessage, nodeId?: string) =>
    set((state) => ({ logEntries: [...state.logEntries, makeEntry(log, nodeId)] }));

  const setNodeState = (nodeId: string, status: NodeRunStatus) =>
    set((state) => ({ nodeRunStates: { ...state.nodeRunStates, [nodeId]: status } }));

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
        set((state) => {
          const entries = [...state.logEntries];
          let index = -1;
          for (let i = entries.length - 1; i >= 0; i -= 1) {
            if (entries[i].stream && entries[i].nodeId === event.nodeId) {
              index = i;
              break;
            }
          }
          if (index >= 0) {
            entries[index] = { ...entries[index], raw: (entries[index].raw ?? '') + event.delta };
            return { logEntries: entries };
          }
          return {
            logEntries: [
              ...entries,
              { ...makeEntry({ level: 'info', raw: event.delta }, event.nodeId), stream: true },
            ],
          };
        });
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
      return true;
    },

    stopRun: () => {
      activeController?.abort();
    },

    closeOutputModal: () => set({ isOutputModalOpen: false }),

    toggleLogOpen: () => set((state) => ({ isLogOpen: !state.isLogOpen })),

    clearLog: () => set({ logEntries: [] }),
  };
});
