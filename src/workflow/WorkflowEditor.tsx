import React from 'react';
import '@xyflow/react/dist/style.css';
import { WorkflowTopBar } from './WorkflowTopBar';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowNodeLibrary } from './panels/WorkflowNodeLibrary';
import { WorkflowPropertiesPanel } from './panels/WorkflowPropertiesPanel';
import { WorkflowLogPanel } from './panels/WorkflowLogPanel';
import { WorkflowOutputModal } from './panels/WorkflowOutputModal';
import { WorkflowDnDProvider } from './dnd/useWorkflowDnD';
import { WorkflowDragGhost } from './dnd/WorkflowDragGhost';

interface WorkflowEditorProps {
  onGoHome: () => void;
}

export function WorkflowEditor({ onGoHome }: WorkflowEditorProps): React.ReactElement {
  return (
    <WorkflowDnDProvider>
      <div
        id="main-content"
        className="relative flex h-screen w-full flex-col"
        style={{ background: 'var(--brand-bg-gradient)' }}
      >
        <WorkflowTopBar onGoHome={onGoHome} />
        <div className="flex min-h-0 flex-1 pt-16">
          <WorkflowNodeLibrary />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1">
              <WorkflowCanvas />
            </div>
            <WorkflowLogPanel />
          </div>
          <WorkflowPropertiesPanel />
        </div>
        <WorkflowDragGhost />
        <WorkflowOutputModal />
      </div>
    </WorkflowDnDProvider>
  );
}
