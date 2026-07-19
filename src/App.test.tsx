import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { useFlowStore } from './store';
import { NodeType } from '@/lib/types';
import { useWorkflowStore } from '@/workflow/store/workflowStore';

vi.mock('./components/HomePage', () => ({
  HomePage: ({
    onLaunch,
    onLaunchWithTemplates,
    onImportJSON,
  }: {
    onLaunch: (kind?: 'chart' | 'workflow') => void;
    onLaunchWithTemplates: () => void;
    onImportJSON: () => void;
  }) => (
    <div data-testid="home-page">
      <button type="button" onClick={() => onLaunch()}>
        Create Flow
      </button>
      <button type="button" onClick={() => onLaunch('workflow')}>
        Create Workflow
      </button>
      <button type="button" onClick={onLaunchWithTemplates}>
        Open Templates
      </button>
      <button type="button" onClick={onImportJSON}>
        Import Flow
      </button>
    </div>
  ),
}));

vi.mock('./components/FlowEditor', () => ({
  FlowEditor: () => <div data-testid="flow-editor">Editor</div>,
}));

vi.mock('./workflow/WorkflowEditor', () => ({
  WorkflowEditor: () => <div data-testid="workflow-editor">Workflow editor</div>,
}));

vi.mock('@/components/app/MobileWorkspaceGate', () => ({
  MobileWorkspaceGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function resetEmptyWorkspace(): void {
  useFlowStore.setState({
    ...useFlowStore.getInitialState(),
    documents: [],
    activeDocumentId: '',
    tabs: [],
    activeTabId: '',
    nodes: [],
    edges: [],
  });
}

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    resetEmptyWorkspace();
    useWorkflowStore.setState({
      mode: 'chart',
      workflowNodes: [],
      workflowEdges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  });

  it('redirects /canvas to home when no active document exists', async () => {
    window.history.pushState({}, '', '/#/canvas');

    render(<App />);

    expect(await screen.findByTestId('home-page')).toBeTruthy();
    expect(screen.queryByTestId('flow-editor')).toBeNull();
  });

  it('redirects invalid flow routes to home when no matching document exists', async () => {
    window.history.pushState({}, '', '/#/flow/missing-flow');

    render(<App />);

    expect(await screen.findByTestId('home-page')).toBeTruthy();
    expect(screen.queryByTestId('flow-editor')).toBeNull();
  });

  it('creates a document before opening the import flow from home', async () => {
    window.history.pushState({}, '', '/#/home');

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Import Flow' }));

    expect(await screen.findByTestId('flow-editor')).toBeTruthy();
    await waitFor(() => {
      expect(useFlowStore.getState().documents).toHaveLength(1);
      expect(useFlowStore.getState().activeDocumentId).not.toBe('');
      expect(window.location.hash).toMatch(/^#\/flow\//);
    });
  });

  it('navigates to the templates page from home without creating a document', async () => {
    window.history.pushState({}, '', '/#/home');

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Open Templates' }));

    await waitFor(() => {
      expect(window.location.hash).toBe('#/templates');
      expect(useFlowStore.getState().documents).toHaveLength(0);
      expect(useFlowStore.getState().activeDocumentId).toBe('');
    });
  });

  it('clears persisted workflow content before opening a new blank workflow', async () => {
    useWorkflowStore.setState({
      workflowNodes: [{
        id: 'stale-node',
        type: NodeType.PROCESS,
        position: { x: 0, y: 0 },
        data: { label: 'Stale node' },
      }],
      workflowEdges: [],
      selectedNodeId: 'stale-node',
    });
    window.history.pushState({}, '', '/#/home');

    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Create Workflow' }));

    expect(await screen.findByTestId('workflow-editor')).toBeTruthy();
    expect(useWorkflowStore.getState().workflowNodes).toHaveLength(0);
    expect(useWorkflowStore.getState().workflowEdges).toHaveLength(0);
    expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
  });
});
