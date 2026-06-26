import React from 'react';
import { useTranslation } from 'react-i18next';
import { WORKFLOW_NODE_CATALOG } from '../nodes/nodeCatalog';
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
      className="pointer-events-none fixed z-[100] flex items-center gap-2 rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 opacity-80 shadow-lg"
      style={{ left: ghostPosition.x + 12, top: ghostPosition.y + 12 }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-[var(--brand-radius)] text-base"
        style={{ backgroundColor: `${meta.accent}1a` }}
      >
        {meta.icon}
      </span>
      <span className="text-sm font-semibold text-[var(--brand-text)]">
        {t(`workflowMode.nodes.${meta.kind}.name`)}
      </span>
    </div>
  );
}
