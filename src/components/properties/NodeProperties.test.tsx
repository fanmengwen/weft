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
  it('keeps content editing controls inside the content group without native selects', () => {
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
    expect(screen.getByPlaceholderText('Enter primary text...')).toBeTruthy();
    expect(screen.getByPlaceholderText('Add descriptive text (Markdown supported)...')).toBeTruthy();
    expect(screen.getByText('Secondary Style')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Text Style' })).toBeNull();
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

  it('uses the shared icon picker for icon-backed asset nodes inside the appearance group', () => {
    render(
      <NodeProperties
        selectedNode={createNode({
          type: 'custom',
          data: {
            label: 'Lambda',
            assetPresentation: 'icon',
            archIconPackId: 'aws-official-starter-v1',
            archIconShapeId: 'compute-lambda',
          },
        })}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: '内容' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('icon-picker')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '外观' }));

    expect(screen.getByText('icon-picker')).toBeTruthy();
  });
});
