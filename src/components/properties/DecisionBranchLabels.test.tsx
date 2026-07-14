import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import { useFlowStore } from '@/store';
import { DecisionBranchLabels } from './DecisionBranchLabels';

const NODE_ID = 'decision-1';

function createOutEdge(
  id: string,
  label: string,
  target = 'target-node'
): FlowEdge {
  return {
    id,
    source: NODE_ID,
    target,
    label,
  } as FlowEdge;
}

function seedEdges(edges: FlowEdge[]): void {
  useFlowStore.setState({
    ...useFlowStore.getInitialState(),
    edges,
  });
}

describe('DecisionBranchLabels', () => {
  beforeEach(() => {
    seedEdges([]);
  });

  it('renders yes and no inputs with labels from the first two out-edges', () => {
    seedEdges([
      createOutEdge('edge-yes', 'Yes'),
      createOutEdge('edge-no', 'No'),
    ]);

    render(<DecisionBranchLabels nodeId={NODE_ID} onChangeEdge={vi.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue('Yes');
    expect(inputs[1]).toHaveValue('No');
    expect(inputs[0]).not.toBeDisabled();
    expect(inputs[1]).not.toBeDisabled();
  });

  it('calls onChangeEdge for the first out-edge when the yes input changes', () => {
    seedEdges([
      createOutEdge('edge-yes', 'Yes'),
      createOutEdge('edge-no', 'No'),
    ]);
    const onChangeEdge = vi.fn();

    render(<DecisionBranchLabels nodeId={NODE_ID} onChangeEdge={onChangeEdge} />);

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Affirmative' } });

    expect(onChangeEdge).toHaveBeenCalledWith('edge-yes', { label: 'Affirmative' });
  });

  it('disables both inputs and shows a hint when there are no out-edges', () => {
    render(<DecisionBranchLabels nodeId={NODE_ID} onChangeEdge={vi.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toBeDisabled();
    expect(inputs[1]).toBeDisabled();
    expect(screen.getByText('连接出边后可编辑分支标签')).toBeTruthy();
  });

  it('enables only the yes input when a single out-edge exists', () => {
    seedEdges([createOutEdge('edge-yes', 'Yes')]);

    render(<DecisionBranchLabels nodeId={NODE_ID} onChangeEdge={vi.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).not.toBeDisabled();
    expect(inputs[1]).toBeDisabled();
    expect(screen.queryByText('连接出边后可编辑分支标签')).toBeNull();
  });
});
