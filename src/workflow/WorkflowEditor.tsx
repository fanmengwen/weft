import React from 'react';
import '@xyflow/react/dist/style.css';
import { WorkflowTopBar } from './WorkflowTopBar';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowNodeLibrary } from './panels/WorkflowNodeLibrary';
import { WorkflowPropertiesPanel } from './panels/WorkflowPropertiesPanel';
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
        className="grid h-screen w-full grid-rows-[52px_1fr] bg-[var(--wf-bg)] text-[var(--wf-text)]"
      >
        <WorkflowTopBar onGoHome={onGoHome} />
        <div className="grid min-h-0 grid-cols-[264px_minmax(0,1fr)_320px]">
          <WorkflowNodeLibrary />
          <WorkflowCanvas />
          <WorkflowPropertiesPanel />
        </div>
        <WorkflowDragGhost />
        <WorkflowOutputModal />
      </div>
    </WorkflowDnDProvider>
  );
}
