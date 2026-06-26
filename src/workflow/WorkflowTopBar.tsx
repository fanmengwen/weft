import React from 'react';
import { useTranslation } from 'react-i18next';
import { TopNavBrand } from '@/components/top-nav/TopNavBrand';
import { ModeSelector } from '@/components/top-nav/ModeSelector';
import { APP_NAME } from '@/lib/brand';

interface WorkflowTopBarProps {
  onGoHome: () => void;
}

export function WorkflowTopBar({ onGoHome }: WorkflowTopBarProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onGoHome}
          aria-label={t('workflowMode.home')}
          title={t('workflowMode.home')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--brand-radius)] text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-glass-bg)] hover:text-[var(--brand-text)]"
        >
          ←
        </button>
        <TopNavBrand appName={APP_NAME} logoUrl={null} logoStyle="text" ui={{ showBeta: true }} />
        <ModeSelector />
      </div>
      <div className="flex min-w-0 flex-1 justify-end">
        <button
          type="button"
          disabled
          title={t('workflowMode.runDisabledHint')}
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-on-primary)] opacity-50"
        >
          {t('workflowMode.run')}
        </button>
      </div>
    </div>
  );
}
