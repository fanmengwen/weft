import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AppMode, useWorkflowStore } from '@/workflow/store/workflowStore';

const OPTIONS: ReadonlyArray<{ mode: AppMode; labelKey: string; ariaKey: string }> = [
  { mode: 'chart', labelKey: 'workflowMode.chart', ariaKey: 'workflowMode.switchToChart' },
  { mode: 'workflow', labelKey: 'workflowMode.workflow', ariaKey: 'workflowMode.switchToWorkflow' },
];

interface ModeSelectorProps {
  /** 'glass' matches the chart top nav; 'flat' matches the workflow editor. */
  variant?: 'glass' | 'flat';
}

const VARIANT_CLASS = {
  glass: {
    container:
      'inline-flex items-center gap-0.5 rounded-full border border-[var(--brand-glass-border)] bg-[var(--brand-glass-bg)] p-0.5 backdrop-blur-[var(--brand-glass-blur)]',
    tab: 'rounded-full px-3 py-1.5 text-sm font-semibold transition-all',
    active: 'bg-[var(--brand-primary)] text-[var(--brand-on-primary)] shadow-sm',
    inactive: 'text-[var(--brand-secondary)] hover:text-[var(--brand-text)]',
  },
  flat: {
    container: 'inline-flex items-center rounded-[9px] bg-[var(--wf-seg-bg)] p-0.5',
    tab: 'rounded-[7px] px-3.5 py-[5px] text-[13px] transition-all',
    active: 'bg-white font-semibold text-[var(--wf-text)] shadow-[0_1px_2px_rgba(16,24,40,0.10)]',
    inactive: 'font-medium text-[var(--wf-text-label)] hover:text-[var(--wf-text)]',
  },
} as const;

export function ModeSelector({ variant = 'glass' }: ModeSelectorProps): React.ReactElement {
  const { t } = useTranslation();
  const mode = useWorkflowStore((state) => state.mode);
  const setMode = useWorkflowStore((state) => state.setMode);
  const classes = VARIANT_CLASS[variant];

  return (
    <div role="tablist" aria-label={t('workflowMode.modeSwitcher')} className={classes.container}>
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
            className={[classes.tab, isActive ? classes.active : classes.inactive].join(' ')}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
