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

vi.mock('@/lib/id', () => ({
  createId: () => 'node-test-id',
}));

vi.mock('@/hooks/nodeLabelEditRequest', () => ({
  queueNodeLabelEditRequest: vi.fn(),
}));

vi.mock('@/store', () => ({
  useFlowStore: Object.assign(vi.fn(), {
    getState: vi.fn(),
  }),
}));

const mockSetNodes = vi.fn();
const mockSetSelectedNodeId = vi.fn();

function captureCreatedNode(setNodes: typeof mockSetNodes): FlowNode | undefined {
  const updater = setNodes.mock.calls.at(-1)?.[0] as ((nodes: FlowNode[]) => FlowNode[]) | undefined;
  if (!updater) {
    return undefined;
  }

  return updater([]).at(-1);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useFlowStore).mockReturnValue({
    setNodes: mockSetNodes,
    setSelectedNodeId: mockSetSelectedNodeId,
  } as never);
  vi.mocked(useFlowStore.getState).mockReturnValue({
    activeLayerId: 'layer-1',
    selectedNodeId: null,
  } as never);
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
    expect(createdNode?.type).toBe('start');
    expect(createdNode?.data.shape).toBe('capsule');
    expect(createdNode?.data.color).toBe('emerald');
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
    expect(createdNode?.type).toBe('custom');
    expect(createdNode?.data.shape).toBe('parallelogram');
  });
});
