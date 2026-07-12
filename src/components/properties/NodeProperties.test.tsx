import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Node } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { NodeProperties } from './NodeProperties';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock('@/hooks/useAssetCatalog', () => ({
  useAssetCatalog: () => ({
    items: [],
    filteredItems: [],
    previewUrls: {},
    query: '',
    setQuery: vi.fn(),
    category: 'all',
    setCategory: vi.fn(),
  }),
}));

vi.mock('./IconPicker', () => ({
  IconPicker: () => <div>icon-picker</div>,
}));

vi.mock('./ColorPicker', () => ({
  ColorPicker: () => <div>color-picker</div>,
}));

vi.mock('./ToneSwatch', () => ({
  ToneSwatch: () => <div>tone-swatch</div>,
}));

function createNode(overrides: Partial<Node<NodeData>> = {}): Node<NodeData> {
  return {
    id: 'node-1',
    type: 'process',
    position: { x: 0, y: 0 },
    data: {
      label: 'API Gateway',
      subLabel: 'Routes traffic to downstream services',
      ...overrides.data,
    },
    ...overrides,
  } as Node<NodeData>;
}

describe('NodeProperties', () => {
  it('keeps per-type content fields inside the content group without native selects', () => {
    const { container } = render(
      <NodeProperties
        selectedNode={createNode()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(container.querySelector('select')).toBeNull();
    expect(screen.getByRole('button', { name: '内容' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('显示名称')).toBeTruthy();
    expect(screen.getByText('说明')).toBeTruthy();
    expect(screen.queryByText('Secondary Style')).toBeNull();
    expect(screen.queryByTitle('Bold (Cmd+B)')).toBeNull();
  });

  it('opens the content group by default and keeps the appearance group collapsed', () => {
    render(
      <NodeProperties
        selectedNode={createNode()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: '内容' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '外观' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses the content group when the appearance group is opened', () => {
    render(
      <NodeProperties
        selectedNode={createNode()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '外观' }));

    expect(screen.getByRole('button', { name: '内容' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: '外观' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <NodeProperties
        selectedNode={createNode()}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledWith('node-1');
  });

  function openAppearanceGroup(): void {
    fireEvent.click(screen.getByRole('button', { name: '外观' }));
  }

  it('renders tone swatch for process nodes without shape selector or image upload', () => {
    render(
      <NodeProperties
        selectedNode={createNode({ type: 'process' })}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    openAppearanceGroup();

    expect(screen.getByText('tone-swatch')).toBeTruthy();
    expect(screen.queryByText('color-picker')).toBeNull();
    expect(screen.getByText('icon-picker')).toBeTruthy();
  });

  it('renders color picker for annotation nodes without tone swatch', () => {
    render(
      <NodeProperties
        selectedNode={createNode({ type: 'annotation' })}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    openAppearanceGroup();

    expect(screen.getByText('color-picker')).toBeTruthy();
    expect(screen.queryByText('tone-swatch')).toBeNull();
    expect(screen.queryByText('icon-picker')).toBeNull();
  });

  it('renders icon picker for icon-asset nodes without tone swatch', () => {
    render(
      <NodeProperties
        selectedNode={createNode({
          type: 'custom',
          data: {
            label: 'Athena',
            assetPresentation: 'icon',
            archIconPackId: 'aws',
            archIconShapeId: 'athena',
          },
        })}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    openAppearanceGroup();

    expect(screen.getByText('icon-picker')).toBeTruthy();
    expect(screen.queryByText('tone-swatch')).toBeNull();
  });

  it('hides icon picker for io nodes and shows it for database nodes', () => {
    const { rerender } = render(
      <NodeProperties
        selectedNode={createNode({
          type: 'custom',
          data: { label: 'IO', shape: 'parallelogram' },
        })}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    openAppearanceGroup();
    expect(screen.queryByText('icon-picker')).toBeNull();

    rerender(
      <NodeProperties
        selectedNode={createNode({
          type: 'custom',
          data: { label: 'Database', shape: 'cylinder' },
        })}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('icon-picker')).toBeTruthy();
  });
});
