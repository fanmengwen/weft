import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';

interface HomeRunNodeSnapshotProps {
  input?: string;
  output?: string;
  status: WorkflowRunRecord['nodeRunStates'][string];
  events: string[];
}

export function HomeRunNodeSnapshot({
  input,
  output,
  status,
  events,
}: HomeRunNodeSnapshotProps): React.ReactElement {
  const { t } = useTranslation();
  const empty = t('homeRuns.snapshotUnavailable');
  return (
    <div className="border-t border-[var(--brand-border)] bg-[var(--brand-background)] px-3.5 py-3">
      <div className="grid gap-2.5 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold text-[var(--brand-secondary)]">
            {t('homeRuns.inputSnapshot')}
          </p>
          <pre className="max-h-44 overflow-auto whitespace-pre-wrap break-all rounded-[8px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-2 font-mono text-[11px] leading-5 text-[var(--brand-secondary)]">
            {input || empty}
          </pre>
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold text-[var(--brand-secondary)]">
            {status === 'failed' ? t('homeRuns.errorSnapshot') : t('homeRuns.outputSnapshot')}
          </p>
          <pre className={`max-h-44 overflow-auto whitespace-pre-wrap break-all rounded-[8px] border px-2.5 py-2 font-mono text-[11px] leading-5 ${status === 'failed' ? 'border-[var(--color-surface-danger-border)] bg-[var(--color-surface-danger-bg)] text-[var(--color-surface-danger-text)]' : 'border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-secondary)]'}`}>
            {output || empty}
          </pre>
        </div>
      </div>
      {events.length > 0 ? (
        <div className="mt-2.5 space-y-1">
          {events.map((event, index) => (
            <p key={`${event}-${index}`} className="flex gap-2 text-[11.5px] text-[var(--brand-secondary)]">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--brand-border)]" />
              <span>{event}</span>
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
