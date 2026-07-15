import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Position } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { DEFAULT_DESIGN_SYSTEM, useFlowStore } from '@/store';
import CustomNode from './CustomNode';
import { attachMermaidImportedNodeMetadata } from '@/services/mermaid/importProvenance';

vi.mock('@/config/rolloutFlags', () => ({
  ROLLOUT_FLAGS: {
    visualQualityV2: true,
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock('@/hooks/useProviderShapePreview', () => ({
  useProviderShapePreview: () => null,
}));

vi.mock('@/lib/reactflowCompat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/reactflowCompat')>();

  return {
    ...actual,
    Handle: () => null,
    NodeResizer: () => null,
    NodeResizeControl: () => null,
    useNodeId: () => null,
    Position: {
      Top: 'top',
      Right: 'right',
      Bottom: 'bottom',
      Left: 'left',
    },
  };
});

function queryNodeContainer(root: ParentNode): HTMLElement | null {
  const element = root.querySelector('[data-transform-diagnostics="1"]');
  return element instanceof HTMLElement ? element : null;
}

function renderCustomNode(options: {
  id: string;
  type: string;
  data: NodeData;
  style?: React.CSSProperties;
}): ReturnType<typeof render> {
  return render(
    <CustomNode
      id={options.id}
      type={options.type}
      selected={false}
      dragging={false}
      zIndex={1}
      data={options.data}
      isConnectable={true}
      xPos={0}
      yPos={0}
      sourcePosition={Position.Right}
      targetPosition={Position.Left}
      {...(options.style ? { style: options.style } : {})}
    />
  );
}

describe('CustomNode compact rounded surface height', () => {
  beforeEach(() => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: 'default',
      selectedNodeId: null,
    });
  });

  it('uses compact minHeight for rounded process nodes without subLabel', () => {
    const { container } = renderCustomNode({
      id: 'compact-process',
      type: 'process',
      data: { label: 'Process' },
    });

    expect(queryNodeContainer(container)?.style.minHeight).toBe('56px');
  });

  it('uses modestly higher minHeight for rounded nodes with subLabel', () => {
    const { container } = renderCustomNode({
      id: 'sublabel-process',
      type: 'process',
      data: { label: 'Pro Tier', subLabel: 'Payment Process' },
    });

    expect(queryNodeContainer(container)?.style.minHeight).toBe('80px');
  });

  it('keeps stadium start nodes at 46px minHeight', () => {
    const { container } = renderCustomNode({
      id: 'start-stadium',
      type: 'start',
      data: { label: 'Begin', shape: 'capsule' },
    });

    expect(queryNodeContainer(container)?.style.minHeight).toBe('46px');
  });

  it('honors imported Mermaid leaf geometry instead of compact rounded minimums', () => {
    const importedNodeData = attachMermaidImportedNodeMetadata(
      {
        id: 'imported-process',
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: 'Imported step' },
      } as const,
      {
        role: 'leaf',
        source: 'official-flowchart',
        fidelity: 'renderer-backed',
      }
    ).data;

    const { container } = renderCustomNode({
      id: 'imported-process',
      type: 'process',
      data: importedNodeData,
      style: { width: 150, height: 70 },
    });

    const nodeContainer = queryNodeContainer(container);
    expect(nodeContainer?.style.minHeight).toBe('70px');
    expect(nodeContainer?.style.height).toBe('70px');
  });
});