import React from 'react';
import { useTranslation } from 'react-i18next';
import type { HomeRunFilter } from './homeRunPresentation';

interface HomeRunListHeaderProps {
  counts: Record<HomeRunFilter, number>;
  filter: HomeRunFilter;
  onFilterChange: (filter: HomeRunFilter) => void;
}

const FILTERS: HomeRunFilter[] = ['all', 'succeeded', 'failed', 'running'];

export function HomeRunListHeader({ counts, filter, onFilterChange }: HomeRunListHeaderProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className="shrink-0 px-4 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-base font-bold tracking-[-0.01em] text-[var(--brand-text)]">{t('nav.runs')}</h1>
        <span className="text-[11.5px] text-[var(--brand-secondary)]">{t('homeRuns.retention', { count: 50 })}</span>
      </div>
      <div className="my-3 flex items-center gap-1 overflow-x-auto pb-px" aria-label={t('homeRuns.filters')}>
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
            data-testid={`runs-filter-${item}`}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors ${filter === item ? 'bg-[var(--brand-primary-50)] font-semibold text-[var(--brand-primary)]' : 'bg-[var(--brand-background)] font-normal text-[var(--brand-secondary)] hover:text-[var(--brand-text)]'}`}
          >
            {item === 'all' ? t('homeRuns.filterAll') : t(`workflowMode.status.${item}`)} {counts[item]}
          </button>
        ))}
      </div>
    </div>
  );
}
