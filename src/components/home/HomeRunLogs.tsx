import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';

interface HomeRunLogsProps {
  record: WorkflowRunRecord;
}

export function HomeRunLogs({ record }: HomeRunLogsProps): React.ReactElement {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-3.5 overflow-hidden rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center gap-2 px-3.5 py-[11px] text-left hover:bg-[var(--brand-background)]" data-testid="runs-log-toggle">
        <ChevronRight className={`h-3 w-3 text-[var(--brand-secondary)] transition-transform ${open ? 'rotate-90' : ''}`} />
        <span className="text-[12.5px] font-semibold text-[var(--brand-text)]">{t('homeRuns.rawLogs')}</span>
        <span className="rounded-full bg-[var(--brand-background)] px-2 py-0.5 text-[10.5px] text-[var(--brand-secondary)]">{t('homeRuns.logCount', { count: record.logEntries.length })}</span>
        <span className="flex-1" />
        <span className="hidden text-[11.5px] text-[var(--brand-secondary)] md:inline">{t('homeRuns.logHint')}</span>
      </button>
      {open ? (
        <div className="max-h-80 space-y-1 overflow-y-auto border-t border-[var(--brand-border)] px-3.5 py-2.5 font-mono text-[11px] leading-5" data-testid="runs-logs">
          {record.logEntries.map((entry) => (
            <div key={entry.id} className="flex items-baseline gap-2.5">
              <span className="shrink-0 text-[var(--brand-secondary)]">{new Date(entry.ts).toLocaleTimeString(undefined, { hour12: false })}</span>
              {entry.nodeLabel ? <span className="shrink-0 text-[var(--brand-primary)]">[{entry.nodeLabel}]</span> : null}
              <span className="min-w-0 whitespace-pre-wrap break-words text-[var(--brand-secondary)]">{entry.messageKey ? t(entry.messageKey, entry.messageParams) : entry.raw}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
