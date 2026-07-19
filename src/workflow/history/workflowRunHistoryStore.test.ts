import { beforeEach, describe, expect, it } from 'vitest';
import {
  WORKFLOW_RUN_HISTORY_LIMIT,
  WORKFLOW_RUN_HISTORY_STORAGE_KEY,
  useWorkflowRunHistoryStore,
  type WorkflowRunRecord,
} from './workflowRunHistoryStore';

function makeRecord(index: number): WorkflowRunRecord {
  return {
    id: `run-${index}`,
    documentId: 'doc-1',
    documentName: '联网热点简报',
    status: 'succeeded',
    startedAt: index,
    finishedAt: index + 10,
    durationMs: 10,
    finalOutput: `result-${index}`,
    nodeRunStates: { input: 'succeeded', output: 'succeeded' },
    logEntries: [
      {
        id: `log-${index}`,
        ts: index,
        level: 'info',
        messageKey: 'workflowMode.log.runSucceeded',
      },
    ],
  };
}

describe('workflow run history store', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkflowRunHistoryStore.setState({ records: [] });
  });

  it('persists a versioned terminal run record', () => {
    useWorkflowRunHistoryStore.getState().addRecord(makeRecord(1));

    const stored = localStorage.getItem(WORKFLOW_RUN_HISTORY_STORAGE_KEY) ?? '';
    expect(stored).toContain('"version":1');
    expect(stored).toContain('联网热点简报');
    expect(stored).not.toContain('apiKey');
  });

  it('keeps only the newest records up to the retention limit', () => {
    for (let index = 0; index < WORKFLOW_RUN_HISTORY_LIMIT + 5; index += 1) {
      useWorkflowRunHistoryStore.getState().addRecord(makeRecord(index));
    }

    const records = useWorkflowRunHistoryStore.getState().records;
    expect(records).toHaveLength(WORKFLOW_RUN_HISTORY_LIMIT);
    expect(records[0]?.id).toBe(`run-${WORKFLOW_RUN_HISTORY_LIMIT + 4}`);
    expect(records.at(-1)?.id).toBe('run-5');
  });

  it('ignores malformed persisted history', () => {
    localStorage.setItem(WORKFLOW_RUN_HISTORY_STORAGE_KEY, '{bad json');
    useWorkflowRunHistoryStore.getState().reload();
    expect(useWorkflowRunHistoryStore.getState().records).toEqual([]);
  });

  it('removes one record from memory and persisted history', () => {
    useWorkflowRunHistoryStore.getState().addRecord(makeRecord(1));
    useWorkflowRunHistoryStore.getState().addRecord(makeRecord(2));

    useWorkflowRunHistoryStore.getState().removeRecord('run-2');

    expect(useWorkflowRunHistoryStore.getState().records.map((record) => record.id)).toEqual([
      'run-1',
    ]);
    expect(localStorage.getItem(WORKFLOW_RUN_HISTORY_STORAGE_KEY)).not.toContain('run-2');
  });
});
