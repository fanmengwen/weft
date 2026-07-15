import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { useFlowStore } from '@/store';
import { useNodeOperationAdders } from './useNodeOperationAdders';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetNodes = vi.fn();
const mockSetSelectedNodeId = vi.fn();

function captureCreatedNode(setNodes: typeof mockSetNodes): FlowNode | undefined {
  const call = setNodes.mock.calls.at(-1);
  if (!call) {
    return undefined;
  }

  const updater = call[0];
  if (typeof updater !== 'function') {
    return undefined;
  }

  return updater([]).at(-1);
}

beforeEach(() => {
  vi.clearAllMocks();
  useFlowStore.setState({
    ...useFlowStore.getInitialState(),
    activeLayerId: 'layer-1',
    selectedNodeId: null,
  });
});

describe('useNodeOperationAdders', () => {
  const recordHistory = vi.fn();

  it('handleAddShape creates a start node when given semantic type start', () => {
    const { result } = renderHook(() =>
      useNodeOperationAdders({
        recordHistory,
        nodesLength: 0,
        setNodes: mockSetNodes,
        setSelectedNodeId: mockSetSelectedNodeId,
      }),
    );

    act(() => {
      result.current.handleAddShape({ type: 'start', shape: 'capsule' });
    });

    const createdNode = captureCreatedNode(mockSetNodes);
    expect(createdNode?.id).toBeTruthy();
    expect(createdNode?.type).toBe('start');
    expect(createdNode?.data.shape).toBe('capsule');
    expect(createdNode?.data.color).toBe('emerald');
    expect(mockSetSelectedNodeId).toHaveBeenCalledWith(createdNode?.id);
  });

  it('handleAddShape creates custom parallelogram nodes for io semantics', () => {
    const { result } = renderHook(() =>
      useNodeOperationAdders({
        recordHistory,
        nodesLength: 0,
        setNodes: mockSetNodes,
        setSelectedNodeId: mockSetSelectedNodeId,
      }),
    );

    act(() => {
      result.current.handleAddShape({ type: 'custom', shape: 'parallelogram' });
    });

    const createdNode = captureCreatedNode(mockSetNodes);
    expect(createdNode?.id).toBeTruthy();
    expect(createdNode?.type).toBe('custom');
    expect(createdNode?.data.shape).toBe('parallelogram');
    expect(mockSetSelectedNodeId).toHaveBeenCalledWith(createdNode?.id);
  });

  it.each([
    [{ type: 'start', shape: 'capsule' }, 'toolbar.start'],
    [{ type: 'end', shape: 'capsule' }, 'toolbar.end'],
    [{ type: 'process', shape: 'rounded' }, 'toolbar.process'],
    [{ type: 'decision', shape: 'diamond' }, 'toolbar.decision'],
    [{ type: 'custom', shape: 'parallelogram' }, 'nodes.inputOutput'],
    [{ type: 'custom', shape: 'cylinder' }, 'nodes.database'],
  ] as const)('handleAddShape assigns default label %s for %o', (input, expectedLabel) => {
    const { result } = renderHook(() =>
      useNodeOperationAdders({
        recordHistory,
        nodesLength: 0,
        setNodes: mockSetNodes,
        setSelectedNodeId: mockSetSelectedNodeId,
      }),
    );

    act(() => {
      result.current.handleAddShape(input);
    });

    const createdNode = captureCreatedNode(mockSetNodes);
    expect(createdNode?.data.label).toBe(expectedLabel);
  });

  it('handleAddShape does not queue empty rename edit that would wipe the default label', () => {
    const { result } = renderHook(() =>
      useNodeOperationAdders({
        recordHistory,
        nodesLength: 0,
        setNodes: mockSetNodes,
        setSelectedNodeId: mockSetSelectedNodeId,
      }),
    );

    act(() => {
      result.current.handleAddShape({ type: 'process', shape: 'rounded' });
    });

    expect(useFlowStore.getState().pendingNodeLabelEditRequest).toBeNull();
    const createdNode = captureCreatedNode(mockSetNodes);
    expect(createdNode?.data.label).toBe('toolbar.process');
  });
});
