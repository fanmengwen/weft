import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useWorkflowRunHistoryStore,
  type WorkflowRunRecord,
} from '@/workflow/history/workflowRunHistoryStore';
import { HomeRunDetails } from './HomeRunDetails';

function resultPreview(record: WorkflowRunRecord): string {
  const compact = record.finalOutput.replace(/\s+/g, ' ').trim();
  return compact || record.logEntries.findLast((entry) => entry.level === 'error')?.raw || '';
}

export function HomeRunsView(): React.ReactElement {
  const { t } = useTranslation();
  const records = useWorkflowRunHistoryStore((state) => state.records);
  const reload = useWorkflowRunHistoryStore((state) => state.reload);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => reload(), [reload]);

  const selected = useMemo(
    () => records.find((record) => record.id === selectedId) ?? records[0] ?? null,
    [records, selectedId]
  );

  return (
    <div className="flex-1 overflow-y-auto" data-testid="home-runs-view">
      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-8 md:px-10 md:pb-16">
        <h1 className="text-[21px] font-bold tracking-tight text-[var(--brand-text)]">
          {t('nav.runs', 'Run center')}
        </h1>
        <p className="mt-2 text-sm text-[var(--brand-secondary)]">
          {t('homeRuns.description', 'Review workflow results and node-by-node logs stored on this device.')}
        </p>

        {records.length === 0 ? (
          <div
            className="mt-8 rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-14 text-center"
            data-testid="runs-empty"
          >
            <p className="font-semibold text-[var(--brand-text)]">
              {t('homeRuns.emptyTitle', 'No workflow runs yet')}
            </p>
            <p className="mt-2 text-sm text-[var(--brand-secondary)]">
              {t('homeRuns.emptyDescription', 'Run a workflow and its result will appear here.')}
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-2" data-testid="runs-list">
              {records.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => setSelectedId(record.id)}
                  data-testid={`run-record-${record.id}`}
                  className={`w-full rounded-[var(--brand-radius)] border p-3.5 text-left transition-colors ${
                    selected?.id === record.id
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)]'
                      : 'border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-[var(--brand-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-[var(--brand-text)]">
                      {record.documentName}
                    </span>
                    <span className="text-xs text-[var(--brand-primary)]">
                      {t(`workflowMode.status.${record.status}`)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--brand-secondary)]">
                    {resultPreview(record) || t('homeRuns.noResult', 'No final output was produced.')}
                  </p>
                  <p className="mt-2 text-[11px] text-[var(--brand-secondary)]">
                    {new Date(record.startedAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
            {selected ? <HomeRunDetails record={selected} /> : null}
          </div>
        )}
      </div>
    </div>
  );
}
