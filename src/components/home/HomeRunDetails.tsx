import React from 'react';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { HomeRunDetailsHeader } from './HomeRunDetailsHeader';
import { HomeRunLogs } from './HomeRunLogs';
import { HomeRunNodeTimeline } from './HomeRunNodeTimeline';
import { HomeRunResult } from './HomeRunResult';

interface HomeRunDetailsProps {
  record: WorkflowRunRecord;
  onOpenFlow: (flowId: string) => void;
  onDelete: (recordId: string) => void;
}

export function HomeRunDetails({
  record,
  onOpenFlow,
  onDelete,
}: HomeRunDetailsProps): React.ReactElement {
  return (
    <article className="min-w-0 flex-1 overflow-y-auto bg-[var(--brand-background)]" data-testid="runs-detail">
      <div className="mx-auto max-w-[920px] px-5 pb-14 pt-6 sm:px-8">
        <HomeRunDetailsHeader
          record={record}
          onOpenFlow={() => onOpenFlow(record.documentId)}
          onDelete={() => onDelete(record.id)}
        />
        <HomeRunResult key={`result-${record.id}`} record={record} />
        <HomeRunNodeTimeline key={record.id} record={record} />
        <HomeRunLogs key={`logs-${record.id}`} record={record} />
      </div>
    </article>
  );
}
