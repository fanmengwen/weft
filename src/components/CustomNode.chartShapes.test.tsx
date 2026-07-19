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

function queryToneChipIcon(root: ParentNode): SVGElement | null {
  const toneChip = queryHTMLElement(root, '[data-chart-node-tone-chip="1"]');
  const icon = toneChip?.querySelector('svg');
  return icon instanceof SVGElement ? icon : null;
}

function queryChartNodeContent(root: ParentNode): HTMLElement | null {
  return queryHTMLElement(root, '[data-chart-node-content="1"]');
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
    expect(upright?.style.transform ?? '').not.toMatch(/rotate\(-45deg\)/);
    expect(screen.getByText('Approved?').parentElement?.style.maxWidth).toBe('92px');
  });

  it('keeps decision diamond content upright while the shell rotor stays rotated', () => {
    const { container } = renderCustomNode({
      id: 'decision-upright',
      type: 'decision',
      data: { label: 'Stay level', shape: 'diamond' },
    });

    const rotor = queryHTMLElement(container, '[data-chart-shape-rotor="1"]');
    const upright = queryHTMLElement(container, '[data-chart-shape-upright="1"]');
    expect(rotor?.style.transform).toContain('rotate(45deg)');
    expect(upright?.style.transform ?? '').toBe('');
  });

  it('applies selected surface tokens to chart div shapes', () => {
    const decisionView = renderCustomNode({
      id: 'decision-selected',
      type: 'decision',
      data: { label: 'Check', shape: 'diamond' },
      selected: true,
    });
    const ioView = renderCustomNode({
      id: 'io-selected',
      type: 'custom',
      data: { label: 'Input', shape: 'parallelogram' },
      selected: true,
    });
    const dbView = renderCustomNode({
      id: 'db-selected',
      type: 'custom',
      data: { label: 'Users DB', shape: 'cylinder' },
      selected: true,
    });

    const decisionRotor = queryHTMLElement(decisionView.container, '[data-chart-shape-rotor="1"]');
    const ioSurface = queryHTMLElement(ioView.container, '[data-chart-div-shape="io"]');
    const dbSurface = queryHTMLElement(dbView.container, '[data-chart-div-shape="database"]');

    expect(decisionRotor?.style.borderColor).toBe('var(--wf-acc)');
    expect(decisionRotor?.style.boxShadow).toBe('var(--wf-shadow-node-selected)');
    expect(ioSurface?.style.borderColor).toBe('var(--wf-acc)');
    expect(ioSurface?.style.boxShadow).toBe('var(--wf-shadow-node-selected)');
    expect(dbSurface?.className).toContain('chart-node-surface--selected');
    expect(queryHTMLElement(dbView.container, '[data-chart-database-body="1"]')?.style.borderColor).toBe(
      'var(--wf-acc)'
    );
  });

  it('renders io nodes with skewed container and counter-skewed content', () => {
    const { container } = renderCustomNode({
      id: 'io-shape',
      type: 'custom',
      data: { label: 'Input', shape: 'parallelogram' },
    });

    const shapeRoot = queryHTMLElement(container, '[data-chart-div-shape="io"]');
    expect(shapeRoot).not.toBeNull();
    expect(shapeRoot?.style.transform).toContain('skewX(-12deg)');
    expect(shapeRoot?.style.borderRadius).toBe('10px');

    const upright = queryHTMLElement(container, '[data-chart-shape-upright="1"]');
    expect(upright).not.toBeNull();
    expect(upright?.style.transform).toContain('skewX(12deg)');
  });

  it('renders database nodes with cap and body segments', () => {
    const { container } = renderCustomNode({
      id: 'db-shape',
      type: 'custom',
      data: { label: 'Users DB', shape: 'cylinder' },
    });

    const shapeRoot = queryHTMLElement(container, '[data-chart-div-shape="database"]');
    expect(shapeRoot).not.toBeNull();

    const cap = queryHTMLElement(container, '[data-chart-database-cap="1"]');
    const body = queryHTMLElement(container, '[data-chart-database-body="1"]');
    expect(cap).not.toBeNull();
    expect(body).not.toBeNull();
    expect(cap?.style.height).toBe('24px');
    expect(cap?.style.borderRadius).toBe('50%');
    expect(body?.style.marginTop).toBe('-12px');
    expect(shapeRoot?.style.filter).toBe('drop-shadow(0 2px 4px rgba(16,24,40,0.06))');
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

  it('renders chart node tone chips with resolved chip icons instead of Settings fallback', () => {
    const startView = renderCustomNode({
      id: 'start-chip',
      type: 'start',
      data: { label: 'Begin' },
    });
    const processView = renderCustomNode({
      id: 'process-chip',
      type: 'process',
      data: { label: 'Process' },
    });
    const ioView = renderCustomNode({
      id: 'io-chip',
      type: 'custom',
      data: { label: 'Input', shape: 'parallelogram' },
    });

    const startChipIcon = queryToneChipIcon(startView.container);
    const processChipIcon = queryToneChipIcon(processView.container);
    const ioChipIcon = queryToneChipIcon(ioView.container);

    expect(startChipIcon?.classList.contains('lucide-play')).toBe(true);
    expect(processChipIcon?.classList.contains('lucide-square')).toBe(true);
    expect(ioChipIcon?.classList.contains('lucide-download')).toBe(true);
    expect(startChipIcon?.classList.contains('lucide-settings')).toBe(false);
  });

  it('does not render legacy NodeShapeSVG polygons for complex shapes', () => {
    const { container } = renderCustomNode({
      id: 'decision-svg-free',
      type: 'decision',
      data: { label: 'No SVG', shape: 'diamond' },
    });

    expect(container.querySelector('svg polygon')).toBeNull();
    expect(queryHTMLElement(container, '[data-chart-div-shape="diamond"]')).not.toBeNull();
  });

  it.each([
    ['start', 'start', { label: 'Begin' }, 'row'],
    ['process', 'process', { label: 'Process', subLabel: 'Step' }, 'row'],
    ['io', 'custom', { label: 'Input', shape: 'parallelogram' }, 'row'],
    ['cylinder', 'custom', { label: 'Users DB', shape: 'cylinder' }, 'row'],
    ['diamond', 'decision', { label: 'Approved?', shape: 'diamond' }, 'column'],
  ] as const)(
    'uses %s chart node content layout %s',
    (_name, type, data, layout) => {
      const { container } = renderCustomNode({
        id: `${_name}-layout`,
        type,
        data,
      });

      const content = queryChartNodeContent(container);
      expect(content).not.toBeNull();
      expect(content?.getAttribute('data-chart-node-layout')).toBe(layout);
    }
  );

  it('centers diamond label column under the tone chip instead of left-packing full width', () => {
    const { container } = renderCustomNode({
      id: 'decision-center',
      type: 'decision',
      data: { label: '判断', shape: 'diamond' },
    });

    const content = queryChartNodeContent(container);
    const textColumn = queryHTMLElement(container, '[data-chart-node-text-column="1"]');
    expect(content?.className).toContain('items-center');
    expect(content?.className).toContain('justify-center');
    expect(content?.className).toContain('gap-[5px]');
    expect(textColumn).not.toBeNull();
    expect(textColumn?.className).toContain('items-center');
    expect(textColumn?.className).toContain('w-auto');
    expect(textColumn?.className).toContain('max-w-[92px]');
    expect(textColumn?.className).not.toContain('w-full');
  });

  it('left-packs process row content with a tighter min width floor', () => {
    const { container } = renderCustomNode({
      id: 'process-pack',
      type: 'process',
      data: { label: '处理' },
    });

    const content = queryChartNodeContent(container);
    const nodeContainer = queryHTMLElement(container, '[data-transform-diagnostics="1"]');
    expect(content?.className).toContain('justify-start');
    expect(content?.className).toContain('items-center');
    expect(nodeContainer?.style.minWidth).toBe('96px');
    expect(nodeContainer?.style.minHeight).toBe('56px');
  });

  it('applies io and cylinder label typography from design', () => {
    const ioView = renderCustomNode({
      id: 'io-typography',
      type: 'custom',
      data: { label: 'Input', shape: 'parallelogram' },
    });
    const dbView = renderCustomNode({
      id: 'db-typography',
      type: 'custom',
      data: { label: 'Users DB', shape: 'cylinder' },
    });

    const ioLabelSurface = ioView.getByText('Input').parentElement;
    const dbLabelSurface = dbView.getByText('Users DB').parentElement;

    expect(ioLabelSurface?.style.fontSize).toBe('12.5px');
    expect(ioLabelSurface?.style.fontWeight).toBe('600');
    expect(dbLabelSurface?.style.fontSize).toBe('12.5px');
    expect(dbLabelSurface?.style.fontWeight).toBe('600');
  });
});
