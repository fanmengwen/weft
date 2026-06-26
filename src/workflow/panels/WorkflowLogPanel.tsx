import React from 'react';
import { useTranslation } from 'react-i18next';

export function WorkflowLogPanel(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className="flex h-10 shrink-0 items-center gap-2 border-t border-[var(--brand-border)] bg-[var(--brand-glass-bg)] px-4 backdrop-blur-[var(--brand-glass-blur)]">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--brand-secondary)]">
        {t('workflowMode.log.title')}
      </span>
      <span className="text-xs text-[var(--brand-secondary)] opacity-70">{t('workflowMode.log.empty')}</span>
    </div>
  );
}
