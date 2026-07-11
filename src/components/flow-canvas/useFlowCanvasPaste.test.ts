import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowCanvasPaste } from './useFlowCanvasPaste';
import { importMermaidToCanvas } from '@/services/mermaid/rendererFirstImport';
import {
  initializeDiagramTypeRuntime,
  resetDiagramTypeRuntimeForTests,
} from '@/diagram-types/bootstrap';
import { unregisterDiagramPluginForTests } from '@/diagram-types/core';
import type { MermaidImportMode } from '@/lib/types';

vi.mock('@/services/mermaid/rendererFirstImport', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/mermaid/rendererFirstImport')>();
  return {
    ...actual,
    importMermaidToCanvas: vi.fn(async ({ importMode }) => ({
      nodes: [
        {
          id: 'svg-1',
          type: 'mermaid_svg',
          position: { x: 40, y: 40 },
          data: { label: 'Mermaid classDiagram' },
        },
      ],
      edges: [],
      visualMode: 'renderer_exact',
      svgExtracted: true,
      importMode,
    })),
  };
});

function createPasteEvent(text: string): React.ClipboardEvent<HTMLDivElement> {
  return {
    target: document.createElement('div'),
    preventDefault: vi.fn(),
    clipboardData: {
      getData: () => text,
    },
  } as unknown as React.ClipboardEvent<HTMLDivElement>;
}

function renderPasteHook(mermaidImportMode: MermaidImportMode) {
  const setNodes = vi.fn();
  const setEdges = vi.fn();

  const { result } = renderHook(() =>
    useFlowCanvasPaste({
      architectureStrictMode: false,
      mermaidImportMode,
      activeTabId: 'tab-1',
      fitView: vi.fn(),
      updateTab: vi.fn(),
      recordHistory: vi.fn(),
      setNodes,
      setEdges,
      setSelectedNodeId: vi.fn(),
      setMermaidDiagnostics: vi.fn(),
      clearMermaidDiagnostics: vi.fn(),
      addToast: vi.fn(),
      strictModePasteBlockedMessage: 'Paste blocked by strict mode.',
      pasteSelection: vi.fn(),
      getLastInteractionFlowPosition: () => null,
      getCanvasCenterFlowPosition: () => ({ x: 0, y: 0 }),
    })
  );

  return { handleCanvasPaste: result.current.handleCanvasPaste, setNodes, setEdges };
}

describe('useFlowCanvasPaste', () => {
  beforeEach(() => {
    vi.mocked(importMermaidToCanvas).mockClear();
    initializeDiagramTypeRuntime();
    unregisterDiagramPluginForTests('classDiagram');
  });

  afterEach(() => {
    resetDiagramTypeRuntimeForTests();
    initializeDiagramTypeRuntime();
  });

  it('routes plugin-missing Mermaid pastes into the snapshot import branch', async () => {
    const { handleCanvasPaste, setNodes, setEdges } = renderPasteHook('renderer_first');

    await handleCanvasPaste(createPasteEvent('classDiagram\nclass Animal'));

    expect(importMermaidToCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        parsed: expect.objectContaining({ nativeParseUnavailable: true }),
        source: 'classDiagram\nclass Animal',
      })
    );
    expect(setNodes).toHaveBeenCalledWith([expect.objectContaining({ type: 'mermaid_svg' })]);
    expect(setEdges).toHaveBeenCalledWith([]);
  });

  it('resolves renderer-first mode from the parse result when native mode is requested', async () => {
    const { handleCanvasPaste } = renderPasteHook('native_editable');

    await handleCanvasPaste(createPasteEvent('classDiagram\nclass Animal'));

    expect(importMermaidToCanvas).toHaveBeenCalledWith(
      expect.objectContaining({ importMode: 'renderer_first' })
    );
  });
});
