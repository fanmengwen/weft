import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';

interface HomeRunDetailsProps {
  record: WorkflowRunRecord;
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }
  return `${(durationMs / 1000).toFixed(1)} s`;
}

export function HomeRunDetails({ record }: HomeRunDetailsProps): React.ReactElement {
  const { t } = useTranslation();
  const nodeLabels = new Map(
    record.logEntries
      .filter((entry) => entry.nodeId && entry.nodeLabel)
      .map((entry) => [entry.nodeId!, entry.nodeLabel!])
  );

  return (
    <section
      className="min-w-0 rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5"
      data-testid="runs-detail"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--brand-text)]">{record.documentName}</h2>
          <p className="mt-1 text-xs text-[var(--brand-secondary)]">
            {new Date(record.startedAt).toLocaleString()} · {formatDuration(record.durationMs)}
          </p>
        </div>
        <span className="rounded-[var(--brand-radius)] bg-[var(--brand-primary-50)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
          {t(`workflowMode.status.${record.status}`)}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-[var(--brand-text)]">
          {t('homeRuns.result', 'Result')}
        </h3>
        <div className="prose prose-sm mt-2 max-w-none rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-[var(--brand-text)]">
          {record.finalOutput ? (
            <MarkdownRenderer content={record.finalOutput} enableBreaks />
          ) : (
            <p className="text-[var(--brand-secondary)]">
              {t('homeRuns.noResult', 'No final output was produced.')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-[var(--brand-text)]">
          {t('homeRuns.nodes', 'Node states')}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(record.nodeRunStates).map(([nodeId, status]) => (
            <span
              key={nodeId}
              className="rounded-[var(--brand-radius)] border border-[var(--brand-border)] px-2.5 py-1 text-xs text-[var(--brand-secondary)]"
            >
              {nodeLabels.get(nodeId) ?? nodeId}:{' '}
              {status === 'skipped'
                ? t('homeRuns.statusSkipped')
                : status === 'idle'
                  ? t('homeRuns.statusIdle')
                  : t(`workflowMode.status.${status}`, { defaultValue: status })}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-[var(--brand-text)]">
          {t('homeRuns.logs', 'Run logs')}
        </h3>
        <div className="mt-2 max-h-72 overflow-y-auto rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-background)] p-3">
          {record.logEntries.map((entry) => (
            <div key={entry.id} className="flex gap-2 py-1 text-xs text-[var(--brand-secondary)]">
              <span className="shrink-0 tabular-nums">
                {new Date(entry.ts).toLocaleTimeString(undefined, { hour12: false })}
              </span>
              {entry.nodeLabel ? <span className="font-semibold">[{entry.nodeLabel}]</span> : null}
              <span className="min-w-0 whitespace-pre-wrap break-words">
                {entry.messageKey ? t(entry.messageKey, entry.messageParams) : entry.raw}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
