import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { useFlowStore } from '@/store';
import { EdgeProperties } from './EdgeProperties';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

function createEdge(overrides: Partial<FlowEdge> = {}): FlowEdge {
  return {
    id: 'edge-1',
    source: 'source-1',
    target: 'target-1',
    data: {},
    ...overrides,
  };
}

describe('EdgeProperties', () => {
  beforeEach(() => {
    useFlowStore.setState({
      nodes: [
        {
          id: 'source-1',
          type: 'process',
          position: { x: 0, y: 0 },
          data: { label: 'API Gateway' },
        } as never,
        {
          id: 'target-1',
          type: 'process',
          position: { x: 0, y: 0 },
          data: { label: 'User Service' },
        } as never,
      ],
      edges: [],
    });
  });

  it('renders endpoint card and delete action without legacy edge sections', () => {
    render(
      <EdgeProperties
        selectedEdge={createEdge()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('连接')).toBeTruthy();
    expect(screen.getByText('API Gateway')).toBeTruthy();
    expect(screen.getByText('User Service')).toBeTruthy();
    expect(screen.getByRole('button', { name: '删除连线' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Label' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Route' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Color' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Appearance' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Condition' })).toBeNull();
  });

  it('calls onDelete with the selected edge id', () => {
    const onDelete = vi.fn();
    render(
      <EdgeProperties
        selectedEdge={createEdge()}
        onChange={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '删除连线' }));

    expect(onDelete).toHaveBeenCalledWith('edge-1');
  });

  it('renders architecture semantics for architecture edges', () => {
    useFlowStore.setState({
      nodes: [
        {
          id: 'arch-source',
          type: 'architecture',
          position: { x: 0, y: 0 },
          data: { label: 'Ingress' },
        } as never,
        {
          id: 'arch-target',
          type: 'architecture',
          position: { x: 0, y: 0 },
          data: { label: 'Service' },
        } as never,
      ],
      edges: [],
    });

    render(
      <EdgeProperties
        selectedEdge={createEdge({ source: 'arch-source', target: 'arch-target' })}
        onChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Architecture' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Direction')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Route' })).toBeNull();
  });
});
