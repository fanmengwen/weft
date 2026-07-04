import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkflowRunStore } from '../store/workflowRunStore';

export function WorkflowOutputModal(): React.ReactElement | null {
  const { t } = useTranslation();
  const isOpen = useWorkflowRunStore((state) => state.isOutputModalOpen);
  const finalOutput = useWorkflowRunStore((state) => state.finalOutput);
  const closeOutputModal = useWorkflowRunStore((state) => state.closeOutputModal);

  if (!isOpen || !finalOutput) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={closeOutputModal}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('workflowMode.outputModal.title')}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[70vh] w-full max-w-xl flex-col gap-3 rounded-[var(--brand-radius-lg,1rem)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--brand-secondary)]">
            {t('workflowMode.outputModal.title')}
          </h2>
          <button
            type="button"
            onClick={closeOutputModal}
            aria-label={t('workflowMode.outputModal.close')}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--brand-radius)] text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-glass-bg)] hover:text-[var(--brand-text)]"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-glass-bg)] p-4 text-sm leading-relaxed text-[var(--brand-text)]">
          {finalOutput}
        </div>
        <button
          type="button"
          onClick={closeOutputModal}
          className="self-end rounded-[var(--brand-radius)] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-on-primary)]"
        >
          {t('workflowMode.outputModal.close')}
        </button>
      </div>
    </div>
  );
}
