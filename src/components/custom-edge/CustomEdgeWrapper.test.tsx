import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { MarkerType } from '@/lib/reactflowCompat';
import { DEFAULT_DESIGN_SYSTEM, useFlowStore } from '@/store';
import { CustomEdgeWrapper } from './CustomEdgeWrapper';
import { DART_ARROW_PATH } from './edgeDartArrow';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock('@/lib/reactflowCompat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/reactflowCompat')>();

  return {
    ...actual,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReactFlow: () => ({
      setEdges: vi.fn(),
      screenToFlowPosition: ({ x, y }: { x: number; y: number }) => ({ x, y }),
    }),
  };
});

const baseEdgeProps = {
  id: 'edge-1',
  path: 'M 0 0 L 100 0',
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 0,
  labelX: 50,
  labelY: 0,
  markerEndConfig: { type: MarkerType.ArrowClosed },
  label: 'Route',
} satisfies Partial<React.ComponentProps<typeof CustomEdgeWrapper>>;

function renderEdge(overrides: Partial<React.ComponentProps<typeof CustomEdgeWrapper>> = {}) {
  return render(
    <svg>
      <CustomEdgeWrapper {...baseEdgeProps} {...overrides} />
    </svg>
  );
}

function renderEdgeWithHtmlLabels(
  overrides: Partial<React.ComponentProps<typeof CustomEdgeWrapper>> = {}
) {
  return render(<CustomEdgeWrapper {...baseEdgeProps} {...overrides} />);
}

function parseLinePath(
  pathData: string
): { x1: number; y1: number; x2: number; y2: number } | null {
  const match = pathData.match(/M\s*([\d.-]+)\s+([\d.-]+)\s+L\s*([\d.-]+)\s+([\d.-]+)/);
  if (!match) {
    return null;
  }

  return {
    x1: Number(match[1]),
    y1: Number(match[2]),
    x2: Number(match[3]),
    y2: Number(match[4]),
  };
}

let originalGetTotalLength: PropertyDescriptor | undefined;
let originalGetPointAtLength: PropertyDescriptor | undefined;

function installPathGeometryStub(): void {
  Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
    configurable: true,
    value: function getTotalLength(this: SVGElement): number {
      const line = parseLinePath(this.getAttribute('d') ?? '');
      if (!line) {
        return 0;
      }

      return Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
    },
  });

  Object.defineProperty(SVGElement.prototype, 'getPointAtLength', {
    configurable: true,
    value: function getPointAtLength(this: SVGElement, length: number) {
      const line = parseLinePath(this.getAttribute('d') ?? '');
      if (!line) {
        return { x: 0, y: 0 };
      }

      const total = Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
      const ratio = total === 0 ? 0 : length / total;
      return {
        x: line.x1 + (line.x2 - line.x1) * ratio,
        y: line.y1 + (line.y2 - line.y1) * ratio,
      };
    },
  });
}

function restorePathGeometryStub(): void {
  if (originalGetTotalLength) {
    Object.defineProperty(SVGElement.prototype, 'getTotalLength', originalGetTotalLength);
  } else {
    Reflect.deleteProperty(SVGElement.prototype, 'getTotalLength');
  }

  if (originalGetPointAtLength) {
    Object.defineProperty(SVGElement.prototype, 'getPointAtLength', originalGetPointAtLength);
  } else {
    Reflect.deleteProperty(SVGElement.prototype, 'getPointAtLength');
  }
}

function requireLabelPill(container: ParentNode): HTMLDivElement {
  const pill = container.querySelector('[data-chart-edge-label-pill="1"]');
  if (!(pill instanceof HTMLDivElement)) {
    throw new Error('Label pill not found');
  }

  return pill;
}

describe('CustomEdgeWrapper edge repaint', () => {
  beforeAll(() => {
    originalGetTotalLength = Object.getOwnPropertyDescriptor(
      SVGElement.prototype,
      'getTotalLength'
    );
    originalGetPointAtLength = Object.getOwnPropertyDescriptor(
      SVGElement.prototype,
      'getPointAtLength'
    );
    installPathGeometryStub();
  });

  afterAll(() => {
    restorePathGeometryStub();
  });

  it('renders default edge stroke with round caps and dart arrow rotation', () => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: DEFAULT_DESIGN_SYSTEM.id,
    });

    const { container } = renderEdge();

    const mainLine = container.querySelector('[data-chart-edge-main="1"]');
    expect(mainLine).toBeTruthy();
    expect(mainLine?.getAttribute('stroke')).toBe('#c3c9d3');
    expect(mainLine?.getAttribute('stroke-width')).toBe('1.6');
    expect(mainLine?.getAttribute('stroke-linecap')).toBe('round');

    const dart = container.querySelector('[data-chart-edge-dart="end"]');
    expect(dart?.getAttribute('d')).toBe(DART_ARROW_PATH);
    expect(dart?.getAttribute('transform')).toMatch(/rotate\(0/);
  });

  it('renders selected accent line, glow halo, and accent dart', () => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: DEFAULT_DESIGN_SYSTEM.id,
    });

    const { container } = renderEdge({ selected: true });

    const glow = container.querySelector('[data-chart-edge-glow="1"]');
    expect(glow?.getAttribute('stroke')).toBe('var(--wf-acc)');
    expect(glow?.getAttribute('stroke-width')).toBe('6');
    expect(glow?.getAttribute('opacity')).toBe('0.14');

    const mainLine = container.querySelector('[data-chart-edge-main="1"]');
    expect(mainLine?.getAttribute('stroke')).toBe('var(--wf-acc)');
    expect(mainLine?.getAttribute('stroke-width')).toBe('2');

    const dart = container.querySelector('[data-chart-edge-dart="end"]');
    expect(dart?.getAttribute('fill')).toBe('var(--wf-acc)');
  });

  it('does not render a start dart on default unidirectional edges', () => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: DEFAULT_DESIGN_SYSTEM.id,
    });

    const { container } = renderEdge();

    expect(container.querySelector('[data-chart-edge-dart="end"]')).toBeTruthy();
    expect(container.querySelector('[data-chart-edge-dart="start"]')).toBeNull();
  });

  it('renders a start dart when markerStart is explicitly configured', () => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: DEFAULT_DESIGN_SYSTEM.id,
    });

    const { container } = renderEdge({
      markerStartConfig: { type: MarkerType.ArrowClosed },
      markerEndConfig: { type: MarkerType.ArrowClosed },
    });

    expect(container.querySelector('[data-chart-edge-dart="start"]')).toBeTruthy();
    expect(container.querySelector('[data-chart-edge-dart="end"]')).toBeTruthy();
  });

  it('renders label capsule styles and selected accent tokens', () => {
    useFlowStore.setState({
      designSystems: [DEFAULT_DESIGN_SYSTEM],
      activeDesignSystemId: DEFAULT_DESIGN_SYSTEM.id,
    });

    const { rerender, container } = renderEdgeWithHtmlLabels({ selected: false });
    const pill = requireLabelPill(container);
    expect(pill.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(pill.style.borderColor).toBe('rgb(230, 232, 236)');
    expect(pill.style.borderRadius).toBe('999px');
    expect(pill.style.padding).toBe('3px 10px');
    expect(pill.style.fontSize).toBe('11px');
    expect(pill.style.fontWeight).toBe('500');
    expect(pill.style.color).toBe('rgb(92, 101, 114)');
    expect(screen.getByText('Route')).toBeTruthy();

    rerender(<CustomEdgeWrapper {...baseEdgeProps} selected />);

    const selectedPill = requireLabelPill(container);
    expect(selectedPill.style.borderColor).toBe('var(--wf-acc)');
    expect(selectedPill.style.color).toBe('var(--wf-acc)');
  });
});
