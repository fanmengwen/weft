import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkflowStore } from '@/workflow/store/workflowStore';
import { ModeSelector } from './ModeSelector';

describe('ModeSelector', () => {
  beforeEach(() => {
    useWorkflowStore.setState({ mode: 'chart' });
  });

  it('renders two mode tabs and switches the store on click', () => {
    render(<ModeSelector />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(useWorkflowStore.getState().mode).toBe('chart');
    fireEvent.click(tabs[1]!);
    expect(useWorkflowStore.getState().mode).toBe('workflow');
  });
});
