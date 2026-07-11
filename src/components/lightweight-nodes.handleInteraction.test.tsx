import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TextNode from './TextNode';
import { Position } from '@/lib/reactflowCompat';

let selectedNodeId: string | null = null;
let currentNodeId: string | null = null;

vi.mock('@/config/rolloutFlags', () => ({
  ROLLOUT_FLAGS: {
    visualQualityV2: true,
  },
}));

vi.mock('@/lib/reactflowCompat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/reactflowCompat')>();

  return {
    ...actual,
    Handle: ({
      className,
      style,
      id,
      position,
      type,
    }: {
      className?: string;
      style?: CSSProperties;
      id?: string;
      position?: string;
      type?: string;
    }) => (
      <div
        data-testid={`handle-${id ?? `${type}-${position}`}`}
        data-class={className ?? ''}
        data-pointer={String(style?.pointerEvents ?? '')}
        data-left={String(style?.left ?? '')}
      />
    ),
    NodeResizer: () => null,
    NodeResizeControl: () => null,
    useNodeId: () => currentNodeId,
    Position: {
      Top: 'top',
      Right: 'right',
      Bottom: 'bottom',
      Left: 'left',
    },
  };
});

vi.mock('@/store', () => ({
  useFlowStore: Object.assign(
    (selector?: (state: Record<string, unknown>) => unknown) => {
      const state = { selectedNodeId, setNodes: vi.fn(), setEdges: vi.fn(), nodes: [], edges: [] };
      return typeof selector === 'function' ? selector(state) : state;
    },
    { getState: () => ({ nodes: [], edges: [], setNodes: vi.fn(), setEdges: vi.fn() }) },
  ),
}));

afterEach(() => {
  selectedNodeId = null;
  currentNodeId = null;
});

describe('lightweight node handle interaction policy', () => {
  it('keeps selected TextNode handles connectable in visualQualityV2', () => {
    render(
      <TextNode
        id="text-1"
        type="text"
        selected={true}
        dragging={false}
        zIndex={1}
        data={{ label: 'Hello' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    for (const handleId of ['target-top', 'target-left', 'source-right', 'source-bottom']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('keeps unselected TextNode handles discoverable', () => {
    render(
      <TextNode
        id="text-2"
        type="text"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Hello' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    for (const handleId of ['target-top', 'target-left', 'source-right', 'source-bottom']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-class')).toContain('flow-handle-hitarea');
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });

  it('keeps TextNode handles visible when the store selection stays active after drag', () => {
    selectedNodeId = 'text-3';
    currentNodeId = 'text-3';

    render(
      <TextNode
        id="text-3"
        type="text"
        selected={false}
        dragging={false}
        zIndex={1}
        data={{ label: 'Hello' }}
        isConnectable={true}
        xPos={0}
        yPos={0}
        sourcePosition={Position.Right}
        targetPosition={Position.Left}
      />
    );

    for (const handleId of ['target-top', 'target-left', 'source-right', 'source-bottom']) {
      const handle = screen.getByTestId(`handle-${handleId}`);
      expect(handle.getAttribute('data-class')).not.toContain('flow-handle-hitarea');
      expect(handle.getAttribute('data-pointer')).toBe('all');
    }
  });
});
