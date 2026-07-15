import { describe, expect, it, vi } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { buildFlowEditorEmptyStateProps } from './flowEditorChromeProps';

function createNode(id: string): FlowNode {
  return {
    id,
    type: 'process',
    position: { x: 0, y: 0 },
    data: { label: id, color: 'slate', shape: 'rounded' },
  };
}

function createParams(overrides: Partial<Parameters<typeof buildFlowEditorEmptyStateProps>[0]> = {}) {
  return {
    nodes: [],
    editorMode: 'canvas' as const,
    isCommandBarOpen: false,
    t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as Parameters<
      typeof buildFlowEditorEmptyStateProps
    >[0]['t'],
    openStudioPanel: vi.fn(),
    openCommandBar: vi.fn(),
    handleAddNode: vi.fn(),
    setPendingAIPrompt: vi.fn(),
    ...overrides,
  };
}

describe('buildFlowEditorEmptyStateProps', () => {
  it('returns empty state props for an empty canvas in canvas mode', () => {
    const result = buildFlowEditorEmptyStateProps(createParams());

    expect(result).toBeDefined();
    expect(result?.title).toBe('Your canvas is empty');
    expect(result?.onTemplates).toEqual(expect.any(Function));
    expect(result?.onAddNode).toEqual(expect.any(Function));
    expect(result?.showStudioHint).toBe(false);
  });

  it('returns undefined when the canvas has nodes', () => {
    const result = buildFlowEditorEmptyStateProps(
      createParams({ nodes: [createNode('n1')] })
    );

    expect(result).toBeUndefined();
  });

  it('keeps empty state visible with studio hint when studio is open', () => {
    const result = buildFlowEditorEmptyStateProps(
      createParams({ editorMode: 'studio' })
    );

    expect(result).toBeDefined();
    expect(result?.showStudioHint).toBe(true);
    expect(result?.studioHintLabel).toBe('AI is ready');
  });

  it('returns undefined when the command bar is open on an empty canvas', () => {
    const result = buildFlowEditorEmptyStateProps(
      createParams({ isCommandBarOpen: true })
    );

    expect(result).toBeUndefined();
  });
});
