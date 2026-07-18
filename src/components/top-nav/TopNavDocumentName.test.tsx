import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_FLOW_NAME } from '@/lib/flowDisplayName';
import { useFlowStore } from '@/store';
import { TopNavDocumentName } from './TopNavDocumentName';

describe('TopNavDocumentName', () => {
  beforeEach(() => {
    useFlowStore.setState({
      documents: [
        {
          id: 'doc-1',
          name: DEFAULT_FLOW_NAME,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          activePageId: 'page-1',
          pages: [
            {
              id: 'page-1',
              name: 'Page 1',
              diagramType: 'flowchart',
              nodes: [],
              edges: [],
              history: { past: [], future: [] },
            },
          ],
        },
      ],
      activeDocumentId: 'doc-1',
    });
  });

  it('renames the active document on commit', () => {
    render(<TopNavDocumentName />);

    fireEvent.click(screen.getByTestId('topnav-document-name'));
    const input = screen.getByTestId('topnav-document-name-input');
    fireEvent.change(input, { target: { value: '请假审批' } });
    fireEvent.blur(input);

    expect(useFlowStore.getState().documents[0]?.name).toBe('请假审批');
  });

  it('cancels rename on Escape without writing the store', () => {
    render(<TopNavDocumentName />);

    fireEvent.click(screen.getByTestId('topnav-document-name'));
    const input = screen.getByTestId('topnav-document-name-input');
    fireEvent.change(input, { target: { value: 'should-not-save' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);

    expect(useFlowStore.getState().documents[0]?.name).toBe(DEFAULT_FLOW_NAME);
  });
});
