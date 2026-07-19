import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { formatRunDuration, formatRunRelativeTime } from './homeRunPresentation';

interface HomeRunDetailsHeaderProps {
  record: WorkflowRunRecord;
  onOpenFlow: () => void;
  onDelete: () => void;
}

export function HomeRunDetailsHeader({
  record,
  onOpenFlow,
  onDelete,
}: HomeRunDetailsHeaderProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const failed = record.status === 'failed' || record.status === 'aborted';
  return (
    <header className="flex flex-col items-start justify-between gap-4 lg:flex-row">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[var(--brand-text)]">
            {record.documentName}
          </h2>
          <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${failed ? 'bg-[var(--color-surface-danger-bg)] text-[var(--color-surface-danger-text)]' : 'bg-[var(--color-surface-success-bg)] text-[var(--color-surface-success-text)]'}`}>
            {t(`workflowMode.status.${record.status}`)}
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] text-[var(--brand-secondary)]">
          {record.inputSummary ? <>{t('homeRuns.inputLabel')}：<span className="font-medium text-[var(--brand-text)]">{record.inputSummary}</span> · </> : null}
          <span title={new Date(record.startedAt).toLocaleString()}>
            {formatRunRelativeTime(record.startedAt, i18n.language, t('homeRuns.justNow'))}
          </span>{' '}
          · {formatRunDuration(record.durationMs)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={onOpenFlow} className="inline-flex h-[30px] items-center gap-1.5 rounded-[8px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 text-[12.5px] font-medium text-[var(--brand-secondary)] hover:bg-[var(--brand-background)]" data-testid="runs-open-workflow">
          <Sparkles className="h-3 w-3 text-[var(--wf-t-llm-fg)]" />
          {t('homeRuns.openWorkflow')}
        </button>
        <button type="button" onClick={onDelete} title={t('homeRuns.deleteRecord')} aria-label={t('homeRuns.deleteRecord')} className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-secondary)] hover:border-[var(--color-surface-danger-border)] hover:bg-[var(--color-surface-danger-bg)] hover:text-[var(--color-surface-danger-text)]" data-testid="runs-delete-record">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
