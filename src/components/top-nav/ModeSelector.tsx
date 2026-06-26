import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AppMode, useWorkflowStore } from '@/workflow/store/workflowStore';

const OPTIONS: ReadonlyArray<{ mode: AppMode; labelKey: string; ariaKey: string }> = [
  { mode: 'chart', labelKey: 'workflowMode.chart', ariaKey: 'workflowMode.switchToChart' },
  { mode: 'workflow', labelKey: 'workflowMode.workflow', ariaKey: 'workflowMode.switchToWorkflow' },
];

export function ModeSelector(): React.ReactElement {
  const { t } = useTranslation();
  const mode = useWorkflowStore((state) => state.mode);
  const setMode = useWorkflowStore((state) => state.setMode);

  return (
    <div
      role="tablist"
      aria-label={t('workflowMode.modeSwitcher')}
      className="inline-flex items-center gap-0.5 rounded-full border border-[var(--brand-glass-border)] bg-[var(--brand-glass-bg)] p-0.5 backdrop-blur-[var(--brand-glass-blur)]"
    >
      {OPTIONS.map((option) => {
        const isActive = option.mode === mode;
        return (
          <button
            key={option.mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={t(option.ariaKey)}
            onClick={() => setMode(option.mode)}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-semibold transition-all',
              isActive
                ? 'bg-[var(--brand-primary)] text-[var(--brand-on-primary)] shadow-sm'
                : 'text-[var(--brand-secondary)] hover:text-[var(--brand-text)]',
            ].join(' ')}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
