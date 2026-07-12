import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Node } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { NodeContentSection } from './NodeContentSection';

function createNode(overrides: Partial<Node<NodeData>> = {}): Node<NodeData> {
  return {
    id: 'node-1',
    type: 'process',
    position: { x: 0, y: 0 },
    data: {
      label: 'API Gateway',
      subLabel: 'Routes traffic',
      ...overrides.data,
    },
    ...overrides,
  } as Node<NodeData>;
}

describe('NodeContentSection', () => {
  it('renders display name and description fields for process nodes without font controls', () => {
    const { container } = render(
      <NodeContentSection selectedNode={createNode({ type: 'process' })} onChange={vi.fn()} embedded />
    );

    expect(screen.getByText('显示名称')).toBeTruthy();
    expect(screen.getByText('说明')).toBeTruthy();
    expect(container.querySelector('select')).toBeNull();
    expect(screen.queryByTitle('Bold (Cmd+B)')).toBeNull();
    expect(screen.queryByTitle('Align Left')).toBeNull();
    expect(screen.queryByText('Secondary Style')).toBeNull();
  });

  it('renders only display name for start nodes', () => {
    render(
      <NodeContentSection selectedNode={createNode({ type: 'start' })} onChange={vi.fn()} embedded />
    );

    expect(screen.getByText('显示名称')).toBeTruthy();
    expect(screen.queryByText('说明')).toBeNull();
    expect(screen.queryByText('条件文本')).toBeNull();
    expect(screen.queryByText('方向')).toBeNull();
  });

  it('renders direction segment for io nodes and writes ioDirection on selection', () => {
    const onChange = vi.fn();
    render(
      <NodeContentSection
        selectedNode={createNode({
          type: 'custom',
          data: { label: 'IO', shape: 'parallelogram' },
        })}
        onChange={onChange}
        embedded
      />
    );

    expect(screen.getByText('方向')).toBeTruthy();
    expect(screen.getByRole('button', { name: '输入' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '输出' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '输出' }));

    expect(onChange).toHaveBeenCalledWith('node-1', { ioDirection: 'output' });
  });

  it('renders condition text for decision nodes and writes subLabel', () => {
    const onChange = vi.fn();
    render(
      <NodeContentSection
        selectedNode={createNode({
          type: 'decision',
          data: { label: 'Check', subLabel: 'x > 0' },
        })}
        onChange={onChange}
        embedded
      />
    );

    expect(screen.getByText('条件文本')).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue('x > 0'), { target: { value: 'y < 1' } });

    expect(onChange).toHaveBeenCalledWith('node-1', { subLabel: 'y < 1' });
  });
});
