import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { formatRunDuration, formatRunRelativeTime, runResultPreview } from './homeRunPresentation';
import { HomeRunStatusIcon } from './HomeRunStatusIcon';

interface HomeRunListCardProps {
  record: WorkflowRunRecord;
  selected: boolean;
  onSelect: (recordId: string) => void;
}

export function HomeRunListCard({ record, selected, onSelect }: HomeRunListCardProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onSelect(record.id)}
      data-testid={`run-record-${record.id}`}
      className={`w-full rounded-[10px] border px-[11px] py-2.5 text-left transition-all ${selected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] ring-2 ring-[color-mix(in_srgb,var(--brand-primary),transparent_88%)]' : 'border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-[var(--brand-primary-200)]'}`}
    >
      <div className="flex items-center gap-2">
        <HomeRunStatusIcon status={record.status} />
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--brand-text)]">{record.inputSummary ? `${t('homeRuns.inputLabel')}：${record.inputSummary}` : record.documentName}</span>
        <span className="shrink-0 text-[11px] text-[var(--brand-secondary)]">{formatRunRelativeTime(record.startedAt, i18n.language, t('homeRuns.justNow'))}</span>
      </div>
      <p className="mt-1 truncate text-[11.5px] leading-5 text-[var(--brand-secondary)]">{runResultPreview(record) || t('homeRuns.noResult')}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="rounded-full bg-[var(--brand-background)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--brand-secondary)]">{formatRunDuration(record.durationMs)}</span>
        <span className="text-[10.5px] text-[var(--brand-secondary)]">{t('homeRuns.manualTrigger')}</span>
      </div>
    </button>
  );
}
