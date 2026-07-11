import React from 'react';
import { useTranslation } from 'react-i18next';
import { WORKFLOW_NODE_CATALOG, WORKFLOW_NODE_CATEGORIES, workflowToneStyle } from '../nodes/nodeCatalog';
import { WorkflowNodeIcon } from '../nodes/WorkflowNodeIcon';
import { useWorkflowDnD } from '../dnd/useWorkflowDnD';

export function WorkflowNodeLibrary(): React.ReactElement {
  const { t } = useTranslation();
  const { startDrag } = useWorkflowDnD();

  return (
    <aside className="flex min-h-0 flex-col border-r border-[var(--wf-border)] bg-[var(--wf-surface)]">
      <h2 className="px-4 pb-1 pt-3.5 text-[13px] font-semibold text-[var(--wf-text)]">
        {t('workflowMode.library.title')}
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2">
        {WORKFLOW_NODE_CATEGORIES.map((category) => (
          <React.Fragment key={category.id}>
            <div className="px-2 pb-1.5 pt-3 text-[11px] tracking-[0.05em] text-[var(--wf-text-faint)]">
              {t(`workflowMode.library.categories.${category.id}`)}
            </div>
            {category.kinds.map((kind) => {
              const meta = WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === kind);
              if (!meta) {
                return null;
              }
              return (
                <div
                  key={kind}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    startDrag(kind, event.clientX, event.clientY);
                  }}
                  className="flex cursor-grab items-center gap-2.5 rounded-lg px-2 py-[7px] transition-colors hover:bg-[var(--wf-hover)] active:cursor-grabbing"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]"
                    style={workflowToneStyle(meta.tone)}
                  >
                    <WorkflowNodeIcon kind={kind} className="h-[15px] w-[15px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium leading-snug text-[var(--wf-text)]">
                      {t(`workflowMode.nodes.${kind}.name`)}
                    </div>
                    <div className="mt-px truncate text-[11.5px] leading-snug text-[var(--wf-text-muted)]">
                      {t(`workflowMode.nodes.${kind}.desc`)}
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <p className="border-t border-[var(--wf-hairline)] px-4 py-2.5 text-xs text-[var(--wf-text-muted)]">
        {t('workflowMode.library.hint')}
      </p>
    </aside>
  );
}
