import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { HomeRunNodeRow } from './HomeRunNodeRow';

interface HomeRunNodeTimelineProps {
  record: WorkflowRunRecord;
}

export function HomeRunNodeTimeline({ record }: HomeRunNodeTimelineProps): React.ReactElement {
  const { t } = useTranslation();
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);
  const nodeEntries = Object.entries(record.nodeRunStates);
  const skipped = nodeEntries.filter(([, status]) => status === 'skipped').length;
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-xs font-semibold text-[var(--brand-secondary)]">
          {t('homeRuns.nodeExecution')}
        </h3>
        <span className="text-[11.5px] text-[var(--brand-secondary)]">
          {t('homeRuns.nodeSummary', { count: nodeEntries.length, skipped })}
        </span>
        <span className="flex-1" />
        <span className="hidden text-[11.5px] text-[var(--brand-secondary)] sm:inline">
          {t('homeRuns.expandHint')}
        </span>
      </div>
      <div className="overflow-hidden rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)]">
        {nodeEntries.map(([nodeId]) => (
          <HomeRunNodeRow
            key={nodeId}
            nodeId={nodeId}
            record={record}
            open={openNodeId === nodeId}
            onToggle={() => setOpenNodeId((current) => (current === nodeId ? null : nodeId))}
          />
        ))}
      </div>
    </section>
  );
}
