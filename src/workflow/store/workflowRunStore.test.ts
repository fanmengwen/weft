import { beforeEach, describe, expect, it } from 'vitest';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { useWorkflowRunStore } from './workflowRunStore';
import { useWorkflowStore } from './workflowStore';

function resetStores(): void {
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
});
