import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Position } from '@/lib/reactflowCompat';
import { useFlowStore } from '@/store';
import AnnotationNode from './AnnotationNode';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock('@/lib/reactflowCompat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/reactflowCompat')>();
  return {
    ...actual,
    Handle: () => null,
    NodeResizer: () => null,
    NodeResizeControl: () => null,
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

function queryStyledElement(root: ParentNode, selector: string): HTMLElement | SVGElement | null {
  const element = root.querySelector(selector);
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    return element;
  }
  return null;
}

function parentHTMLElement(element: Element | null): HTMLElement | null {
  const parent = element?.parentElement ?? null;
  return parent instanceof HTMLElement ? parent : null;
}

function renderAnnotation(color?: string): ReturnType<typeof render> {
  return render(
    <AnnotationNode
      id="note-1"
      type="annotation"
      selected={false}
      dragging={false}
      zIndex={1}
      data={{ label: 'Title', subLabel: 'Body copy', color }}
      isConnectable={true}
      xPos={0}
      yPos={0}
      sourcePosition={Position.Right}
      targetPosition={Position.Left}
    />
  );
}

describe('AnnotationNode sticky note repaint', () => {
  beforeEach(() => {
    useFlowStore.setState({
      nodes: [],
      setNodes: vi.fn(),
      recordHistoryV2: vi.fn(),
    });
  });

  it('renders yellow sticky note surface tokens', () => {
    const { container } = renderAnnotation('yellow');
    const surface = queryHTMLElement(container, '[data-annotation-surface="1"]');
    expect(surface).not.toBeNull();
    expect(surface?.style.background).toBe('linear-gradient(180deg, rgb(254, 250, 235), rgb(253, 246, 220))');
    expect(surface?.style.borderColor).toBe('rgb(239, 226, 182)');
    expect(surface?.style.borderRadius).toBe('10px');

    const icon = queryStyledElement(container, '[data-annotation-icon="1"]');
    expect(icon?.style.color).toBe('rgb(168, 134, 43)');

    const body = parentHTMLElement(screen.getByText('Body copy'));
    expect(body?.style.color).toBe('rgb(107, 90, 29)');
    expect(body?.style.fontSize).toBe('12px');
  });

  it('renders green and blue sticky note themes', () => {
    const green = renderAnnotation('emerald');
    const greenSurface = queryHTMLElement(green.container, '[data-annotation-surface="1"]');
    expect(greenSurface?.style.background).toBe('linear-gradient(180deg, rgb(235, 250, 235), rgb(220, 246, 220))');

    green.unmount();

    const blue = renderAnnotation('blue');
    const blueSurface = queryHTMLElement(blue.container, '[data-annotation-surface="1"]');
    expect(blueSurface?.style.background).toBe('linear-gradient(180deg, rgb(235, 243, 250), rgb(220, 238, 253))');
  });

  it('maps legacy red and purple colors to the yellow theme at render time', () => {
    const red = renderAnnotation('red');
    const redSurface = queryHTMLElement(red.container, '[data-annotation-surface="1"]');
    expect(redSurface?.style.background).toBe('linear-gradient(180deg, rgb(254, 250, 235), rgb(253, 246, 220))');

    red.unmount();

    const purple = renderAnnotation('violet');
    const purpleSurface = queryHTMLElement(purple.container, '[data-annotation-surface="1"]');
    expect(purpleSurface?.style.background).toBe('linear-gradient(180deg, rgb(254, 250, 235), rgb(253, 246, 220))');
  });

  it('applies data.fontSize to annotation body text', () => {
    const { container, unmount } = render(
      <AnnotationNode
        id="note-1"
        type="annotation"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Title', subLabel: 'Body copy', fontSize: '18' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    const body = parentHTMLElement(screen.getByText('Body copy'));
    expect(body?.style.fontSize).toBe('18px');

    unmount();

    render(
      <AnnotationNode
        id="note-2"
        type="annotation"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Title', subLabel: 'Default size' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    const defaultBody = parentHTMLElement(screen.getByText('Default size'));
    expect(defaultBody?.style.fontSize).toBe('12px');
    expect(container).toBeTruthy();
  });
});
