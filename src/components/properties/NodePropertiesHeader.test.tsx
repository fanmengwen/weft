import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Node } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { NodePropertiesHeader } from './NodePropertiesHeader';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

function createNode(overrides: Partial<Node<NodeData>> = {}): Node<NodeData> {
  return {
    id: 'node-1',
    type: 'process',
    position: { x: 0, y: 0 },
    data: {
      label: 'API Gateway',
      shape: 'rounded',
      ...overrides.data,
    },
    ...overrides,
  } as Node<NodeData>;
}

describe('NodePropertiesHeader', () => {
  it('renders the localized type label and node name', () => {
    render(<NodePropertiesHeader selectedNode={createNode()} onChange={vi.fn()} />);

    expect(screen.getByText('API Gateway')).toBeTruthy();
    expect(screen.getByText('Process')).toBeTruthy();
  });

  it('enters edit mode on name click and commits label on Enter', () => {
    const onChange = vi.fn();
    render(<NodePropertiesHeader selectedNode={createNode()} onChange={onChange} />);

    fireEvent.click(screen.getByText('API Gateway'));
    const input = screen.getByDisplayValue('API Gateway');
    fireEvent.change(input, { target: { value: 'Updated Gateway' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('node-1', { label: 'Updated Gateway' });
    expect(screen.queryByDisplayValue('Updated Gateway')).toBeNull();
  });

  it('exits edit mode on Escape without calling onChange', () => {
    const onChange = vi.fn();
    render(<NodePropertiesHeader selectedNode={createNode()} onChange={onChange} />);

    fireEvent.click(screen.getByText('API Gateway'));
    const input = screen.getByDisplayValue('API Gateway');
    fireEvent.change(input, { target: { value: 'Discarded Name' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('API Gateway')).toBeTruthy();
    expect(screen.queryByDisplayValue('Discarded Name')).toBeNull();
  });
});
