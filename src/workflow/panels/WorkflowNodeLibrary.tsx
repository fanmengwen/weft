import React from 'react';
import { useTranslation } from 'react-i18next';
import { WORKFLOW_NODE_CATALOG } from '../nodes/nodeCatalog';
import { useWorkflowDnD } from '../dnd/useWorkflowDnD';

export function WorkflowNodeLibrary(): React.ReactElement {
  const { t } = useTranslation();
  const { startDrag } = useWorkflowDnD();

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 border-r border-[var(--brand-border)] bg-[var(--brand-glass-bg)] p-4 backdrop-blur-[var(--brand-glass-blur)]">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--brand-secondary)]">
        {t('workflowMode.library.title')}
      </h2>
      <div className="flex flex-col gap-2">
        {WORKFLOW_NODE_CATALOG.map((node) => (
          <div
            key={node.kind}
            role="button"
            tabIndex={0}
            onPointerDown={(event) => {
              event.preventDefault();
              startDrag(node.kind, event.clientX, event.clientY);
            }}
            className="flex cursor-grab items-start gap-3 rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--brand-radius)] text-lg"
              style={{ backgroundColor: `${node.accent}1a` }}
            >
              {node.icon}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold text-[var(--brand-text)]">
                {t(`workflowMode.nodes.${node.kind}.name`)}
              </span>
              <span className="text-xs text-[var(--brand-secondary)]">
                {t(`workflowMode.nodes.${node.kind}.desc`)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-auto text-xs text-[var(--brand-secondary)]">{t('workflowMode.library.hint')}</p>
    </aside>
  );
}
