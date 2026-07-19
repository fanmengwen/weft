import { beforeEach, describe, expect, it } from 'vitest';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { useWorkflowRunStore } from './workflowRunStore';
import { useWorkflowStore } from './workflowStore';
import { useWorkflowRunHistoryStore } from '../history/workflowRunHistoryStore';

function resetStores(): void {
  localStorage.clear();
  useWorkflowStore.setState({
    mode: 'workflow',
    workflowNodes: [],
    workflowEdges: [],
    selectedNodeId: null,
  });
  useWorkflowRunStore.setState({
    runStatus: 'idle',
    nodeRunStates: {},
    logEntries: [],
    lastRunOutputs: {},
    finalOutput: null,
    isOutputModalOpen: false,
    isLogOpen: false,
  });
  useWorkflowRunHistoryStore.setState({ records: [] });
}

describe('useWorkflowRunStore', () => {
  beforeEach(resetStores);

  it('runs a textInput → output chain end to end', async () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    (input.data as { text?: string }).text = '你好,工作流';
    const output = createWorkflowNode('output', { x: 1, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([input, output]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: input.id,
      target: output.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });

    const ok = await useWorkflowRunStore.getState().startRun();

    expect(ok).toBe(true);
    const state = useWorkflowRunStore.getState();
    expect(state.runStatus).toBe('succeeded');
    expect(state.nodeRunStates[input.id]).toBe('succeeded');
    expect(state.nodeRunStates[output.id]).toBe('succeeded');
    expect(state.finalOutput).toBe('你好,工作流');
    expect(state.isOutputModalOpen).toBe(true);
    expect(state.lastRunOutputs[input.id]).toEqual({ text: '你好,工作流' });
    expect(state.logEntries.some((entry) => entry.messageKey === 'workflowMode.log.runSucceeded')).toBe(
      true
    );
    expect(useWorkflowRunHistoryStore.getState().records).toEqual([
      expect.objectContaining({
        status: 'succeeded',
        inputSummary: '你好,工作流',
        finalOutput: '你好,工作流',
        nodeSnapshots: expect.objectContaining({
          [input.id]: expect.objectContaining({
            kind: 'textInput',
            outputSnapshot: expect.stringContaining('你好,工作流'),
          }),
        }),
      }),
    ]);
  });

  it('fails validation for an empty canvas and logs the issue', async () => {
    const ok = await useWorkflowRunStore.getState().startRun();

    expect(ok).toBe(false);
    const state = useWorkflowRunStore.getState();
    expect(state.runStatus).toBe('failed');
    expect(
      state.logEntries.some(
        (entry) => entry.messageKey === 'workflowMode.log.validation.emptyGraph'
      )
    ).toBe(true);
  });

  it('runs a single node against cached upstream outputs', async () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    (input.data as { text?: string }).text = 'cached upstream';
    const output = createWorkflowNode('output', { x: 1, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([input, output]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: input.id,
      target: output.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });

    // First run the entry node alone, then replay the output node from cache.
    await useWorkflowRunStore.getState().runSingleNode(input.id);
    expect(useWorkflowRunStore.getState().lastRunOutputs[input.id]).toEqual({
      text: 'cached upstream',
    });

    await useWorkflowRunStore.getState().runSingleNode(output.id);

    const state = useWorkflowRunStore.getState();
    expect(state.nodeRunStates[output.id]).toBe('succeeded');
    expect(state.lastRunOutputs[output.id]).toEqual({ text: 'cached upstream' });
    expect(state.runStatus).toBe('idle');
  });

  it('warns when single-node upstream outputs are missing', async () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    const output = createWorkflowNode('output', { x: 1, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([input, output]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: input.id,
      target: output.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });

    await useWorkflowRunStore.getState().runSingleNode(output.id);

    const state = useWorkflowRunStore.getState();
    expect(
      state.logEntries.some(
        (entry) => entry.messageKey === 'workflowMode.log.singleRunMissingUpstream'
      )
    ).toBe(true);
    expect(state.nodeRunStates[output.id]).toBe('succeeded');
  });

  it('keeps lastRunOutputs across runs but clears the log', async () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    (input.data as { text?: string }).text = 'first';
    const output = createWorkflowNode('output', { x: 1, y: 0 });
    useWorkflowStore.getState().setWorkflowNodes([input, output]);
    useWorkflowStore.getState().onWorkflowConnect({
      source: input.id,
      target: output.id,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    await useWorkflowRunStore.getState().startRun();

    useWorkflowStore.getState().setWorkflowNodes([]);
    useWorkflowStore.getState().setWorkflowEdges([]);
    await useWorkflowRunStore.getState().startRun();

    const state = useWorkflowRunStore.getState();
    expect(state.lastRunOutputs[input.id]).toEqual({ text: 'first' });
    expect(state.logEntries.every((entry) => entry.messageKey !== 'workflowMode.log.runSucceeded')).toBe(
      true
    );
  });

  it('clears transient state when switching workflow documents', () => {
    useWorkflowRunStore.setState({
      runStatus: 'succeeded',
      nodeRunStates: { input: 'succeeded' },
      logEntries: [{ id: 'log-1', ts: 1, level: 'info', raw: 'done' }],
      lastRunOutputs: { input: { text: 'done' } },
      finalOutput: 'done',
      isOutputModalOpen: true,
      isLogOpen: true,
    });

    useWorkflowRunStore.getState().clearRunState();

    expect(useWorkflowRunStore.getState()).toMatchObject({
      runStatus: 'idle',
      nodeRunStates: {},
      logEntries: [],
      lastRunOutputs: {},
      finalOutput: null,
      isOutputModalOpen: false,
      isLogOpen: false,
    });
  });
});
