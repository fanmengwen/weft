import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

vi.mock('@/config/rolloutFlags', () => ({
  ROLLOUT_FLAGS: {
    canvasInteractionsV1: true,
  },
}));

function renderShortcuts(overrides: Partial<Parameters<typeof useKeyboardShortcuts>[0]> = {}): void {
  const baseHandlers = {
    selectedNodeId: 'node-1',
    selectedEdgeId: null,
    selectedNodeType: 'process',
    deleteNode: vi.fn(),
    deleteEdge: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    duplicateNode: vi.fn(),
    selectAll: vi.fn(),
    onCommandBar: vi.fn(),
    onSearch: vi.fn(),
    onShortcutsHelp: vi.fn(),
  };
  renderHook(() => useKeyboardShortcuts({ ...baseHandlers, ...overrides }));
}

describe('useKeyboardShortcuts', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('triggers duplicate when Cmd/Ctrl+D is pressed outside editable fields', () => {
    const duplicateNode = vi.fn();
    renderShortcuts({ duplicateNode });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true }));

    expect(duplicateNode).toHaveBeenCalledWith('node-1');
  });

  it('does not trigger duplicate while focused in editable input', () => {
    const duplicateNode = vi.fn();
    renderShortcuts({ duplicateNode });
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true }));

    expect(duplicateNode).not.toHaveBeenCalled();
  });

  it('dispatches node label edit request when F2 is pressed with selected node', () => {
    renderShortcuts();
    const requestListener = vi.fn();
    window.addEventListener('flowmind:node-label-edit-request', requestListener as EventListener);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));

    expect(requestListener).toHaveBeenCalledTimes(1);
    window.removeEventListener('flowmind:node-label-edit-request', requestListener as EventListener);
  });
});
