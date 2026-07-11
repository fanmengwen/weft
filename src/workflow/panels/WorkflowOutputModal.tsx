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
        className="flex max-h-[70vh] w-full max-w-xl flex-col gap-3 rounded-xl border border-[var(--wf-border)] bg-white p-5 shadow-[0_16px_40px_rgba(16,24,40,0.14)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-[var(--wf-text)]">
            {t('workflowMode.outputModal.title')}
          </h2>
          <button
            type="button"
            onClick={closeOutputModal}
            aria-label={t('workflowMode.outputModal.close')}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[var(--wf-text-label)] transition-colors hover:bg-[var(--wf-hover)]"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--wf-border)] bg-[var(--wf-bg)] p-4 text-sm leading-relaxed text-[var(--wf-text)]">
          {finalOutput}
        </div>
        <button
          type="button"
          onClick={closeOutputModal}
          className="self-end rounded-lg bg-[var(--wf-acc)] px-4 py-2 text-[13px] font-semibold text-white transition-[filter] hover:brightness-[0.94]"
        >
          {t('workflowMode.outputModal.close')}
        </button>
      </div>
    </div>
  );
}
