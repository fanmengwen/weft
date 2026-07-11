import React from 'react';
import { useTranslation } from 'react-i18next';
import { WORKFLOW_NODE_CATALOG, workflowToneStyle } from '../nodes/nodeCatalog';
import { WorkflowNodeIcon } from '../nodes/WorkflowNodeIcon';
import { useWorkflowDnD } from './useWorkflowDnD';

export function WorkflowDragGhost(): React.ReactElement | null {
  const { t } = useTranslation();
  const { draggingKind, ghostPosition } = useWorkflowDnD();

  if (!draggingKind) {
    return null;
  }

  const meta = WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === draggingKind);
  if (!meta) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-[100] flex items-center gap-2.5 rounded-[10px] border border-[var(--wf-node-border)] bg-white px-3 py-2 opacity-80 shadow-[var(--wf-shadow-node-selected)]"
      style={{ left: ghostPosition.x + 12, top: ghostPosition.y + 12 }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-[7px]"
        style={workflowToneStyle(meta.tone)}
      >
        <WorkflowNodeIcon kind={meta.kind} className="h-[15px] w-[15px]" />
      </span>
      <span className="text-[13px] font-semibold text-[var(--wf-text)]">
        {t(`workflowMode.nodes.${meta.kind}.name`)}
      </span>
    </div>
  );
}
