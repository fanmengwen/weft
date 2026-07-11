import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReactFlowProvider } from '@/lib/reactflowCompat';
import { ToastProvider } from '@/components/ui/ToastContext';
import { WorkflowEditor } from './WorkflowEditor';
import { useWorkflowStore } from './store/workflowStore';

describe('WorkflowEditor', () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      mode: 'workflow',
      workflowNodes: [],
      workflowEdges: [],
      selectedNodeId: null,
    });
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  });

  it('renders the shell: mode selector + 7 node library cards', () => {
    render(
      <ToastProvider>
        <ReactFlowProvider>
          <WorkflowEditor onGoHome={() => {}} />
        </ReactFlowProvider>
      </ToastProvider>
    );
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    // i18n is not initialized here, so t() echoes the key strings.
    const kinds = [
      'textInput',
      'llm',
      'webSearch',
      'knowledgeRetrieval',
      'ifElse',
      'code',
      'output',
    ];
    for (const kind of kinds) {
      expect(
        screen.getAllByText(`workflowMode.nodes.${kind}.name`).length
      ).toBeGreaterThan(0);
    }
  });
});
