import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Position } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { DEFAULT_DESIGN_SYSTEM, useFlowStore } from '@/store';
import CustomNode from './CustomNode';

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

function queryHTMLElement(root: ParentNode, selector: string): HTMLElement | null {
  const element = root.querySelector(selector);
  return element instanceof HTMLElement ? element : null;
}

function renderCustomNode(options: {
  id: string;
  type: string;
  data: NodeData;
  selected?: boolean;
}): ReturnType<typeof render> {
  return render(
    <CustomNode
      id={options.id}
      type={options.type}
      selected={options.selected ?? false}
      dragging={false}
      zIndex={1}
      data={options.data}
      isConnectable={true}
      xPos={0}
      yPos={0}
      sourcePosition={Position.Right}
      targetPosition={Position.Left}
    />
  );
}

describe('CustomNode chart div shapes', () => {
  beforeEach(() => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: 'default',
      selectedNodeId: null,
    });
  });

  it('renders decision nodes with a 148px square container and rotated inner surface', () => {
    const { container } = renderCustomNode({
      id: 'decision-shape',
      type: 'decision',
      data: { label: 'Approved?', shape: 'diamond' },
    });

    const shapeRoot = queryHTMLElement(container, '[data-chart-div-shape="diamond"]');
    expect(shapeRoot).not.toBeNull();
    expect(shapeRoot?.style.width).toBe('148px');
    expect(shapeRoot?.style.height).toBe('148px');

    const rotor = queryHTMLElement(container, '[data-chart-shape-rotor="1"]');
    expect(rotor).not.toBeNull();
    expect(rotor?.style.transform).toContain('rotate(45deg)');
    expect(rotor?.style.borderRadius).toBe('15px');
    expect(rotor?.style.inset).toBe('16px');

    const upright = queryHTMLElement(container, '[data-chart-shape-upright="1"]');
    expect(upright).not.toBeNull();
    expect(upright?.style.transform).toContain('rotate(-45deg)');
    expect(screen.getByText('Approved?').parentElement?.style.maxWidth).toBe('92px');
  });

  it('falls back legacy hexagon shapes to rounded surfaces', () => {
    const { container } = renderCustomNode({
      id: 'legacy-hex',
      type: 'process',
      data: { label: 'Legacy', shape: 'hexagon' },
    });

    const nodeContainer = queryHTMLElement(container, '[data-transform-diagnostics="1"]');
    expect(nodeContainer).not.toBeNull();
    expect(nodeContainer?.className).toContain('chart-node-surface--rounded');
    expect(container.querySelector('[data-chart-div-shape]')).toBeNull();
    expect(container.querySelector('polygon')).toBeNull();
  });
});

