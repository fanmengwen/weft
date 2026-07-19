import React from 'react';
import { Check, LoaderCircle, X } from 'lucide-react';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';

interface HomeRunNodeStatusIconProps {
  status: WorkflowRunRecord['nodeRunStates'][string];
}

export function HomeRunNodeStatusIcon({ status }: HomeRunNodeStatusIconProps): React.ReactElement {
  if (status === 'succeeded') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-surface-success-bg)] text-[var(--color-surface-success-text)]">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-surface-danger-text)] text-[var(--brand-on-primary)]">
        <X className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'running') {
    return <LoaderCircle className="h-4 w-4 animate-spin text-[var(--brand-primary)]" />;
  }
  return <span className={`h-4 w-4 rounded-full border-[1.5px] ${status === 'skipped' ? 'border-dashed' : ''} border-[var(--brand-border)]`} />;
}
