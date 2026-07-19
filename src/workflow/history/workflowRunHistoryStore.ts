import { z } from 'zod';
import { create } from 'zustand';

export const WORKFLOW_RUN_HISTORY_STORAGE_KEY = 'weft-workflow-runs-v1';
export const WORKFLOW_RUN_HISTORY_LIMIT = 50;

const nodeRunStatusSchema = z.enum(['idle', 'running', 'succeeded', 'failed', 'skipped']);
const workflowRunStatusSchema = z.enum(['succeeded', 'failed', 'aborted']);
const workflowLogEntrySchema = z.object({
  id: z.string(),
  ts: z.number(),
  nodeId: z.string().optional(),
  nodeLabel: z.string().optional(),
  stream: z.boolean().optional(),
  level: z.enum(['info', 'warn', 'error']),
  messageKey: z.string().optional(),
  messageParams: z.record(z.union([z.string(), z.number()])).optional(),
  raw: z.string().optional(),
});

export const workflowRunRecordSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  documentName: z.string(),
  status: workflowRunStatusSchema,
  startedAt: z.number(),
  finishedAt: z.number(),
  durationMs: z.number().nonnegative(),
  finalOutput: z.string(),
  nodeRunStates: z.record(nodeRunStatusSchema),
  logEntries: z.array(workflowLogEntrySchema),
});

export type WorkflowRunRecord = z.infer<typeof workflowRunRecordSchema>;

const workflowRunHistoryPayloadSchema = z.object({
  version: z.literal(1),
  records: z.array(workflowRunRecordSchema),
});

function readStoredRecords(): WorkflowRunRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(WORKFLOW_RUN_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = workflowRunHistoryPayloadSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.records.slice(0, WORKFLOW_RUN_HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

function writeStoredRecords(records: WorkflowRunRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(
      WORKFLOW_RUN_HISTORY_STORAGE_KEY,
      JSON.stringify({ version: 1, records })
    );
  } catch {
    return;
  }
}

interface WorkflowRunHistoryState {
  records: WorkflowRunRecord[];
  addRecord: (record: WorkflowRunRecord) => void;
  reload: () => void;
}

export const useWorkflowRunHistoryStore = create<WorkflowRunHistoryState>()((set) => ({
  records: readStoredRecords(),
  addRecord: (record) =>
    set((state) => {
      const records = [record, ...state.records].slice(0, WORKFLOW_RUN_HISTORY_LIMIT);
      writeStoredRecords(records);
      return { records };
    }),
  reload: () => set({ records: readStoredRecords() }),
}));
