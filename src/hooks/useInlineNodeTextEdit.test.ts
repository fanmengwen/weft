import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { createId } from '@/lib/id';
import { useFlowStore } from '@/store';
import { describe, expect, it, vi } from 'vitest';
import { useInlineNodeTextEdit } from './useInlineNodeTextEdit';
import { requestNodeLabelEdit } from './nodeLabelEditRequest';

vi.mock('@/config/rolloutFlags', () => ({
  ROLLOUT_FLAGS: {
    canvasInteractionsV1: true,
  },
}));

describe('useInlineNodeTextEdit', () => {
  it('creates connected sibling when Tab is pressed while editing', () => {
    const nodeId = createId('node');
    useFlowStore.setState((state) => ({
      ...state,
      nodes: [{
        id: nodeId,
        type: 'process',
        position: { x: 100, y: 120 },
        data: { label: 'Source', shape: 'rounded', color: 'slate' },
      }],
      edges: [],
      selectedNodeId: nodeId,
    }));

    const { result } = renderHook(() => useInlineNodeTextEdit(nodeId, 'label', 'Source'));
    act(() => {
      result.current.beginEdit();
    });

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const tabEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault,
      stopPropagation,
    } as unknown as KeyboardEvent<HTMLInputElement>;

    act(() => {
      result.current.handleKeyDown(tabEvent);
    });

    const state = useFlowStore.getState();
    expect(preventDefault).toHaveBeenCalled();
    expect(state.nodes.length).toBe(2);
    expect(state.edges.length).toBe(1);
    expect(state.edges[0].source).toBe(nodeId);
  });

  it('enters edit mode when matching node label edit request is dispatched', () => {
    const { result } = renderHook(() => useInlineNodeTextEdit('node-1', 'label', 'Original'));

    expect(result.current.isEditing).toBe(false);

    act(() => {
      requestNodeLabelEdit('node-1');
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.draft).toBe('Original');
  });
});
