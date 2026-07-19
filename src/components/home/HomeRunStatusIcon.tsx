import React from 'react';
import { Check, LoaderCircle, X } from 'lucide-react';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';

interface HomeRunStatusIconProps {
  status: WorkflowRunRecord['status'] | 'running';
}

export function HomeRunStatusIcon({ status }: HomeRunStatusIconProps): React.ReactElement {
  if (status === 'running') {
    return <LoaderCircle className="h-[15px] w-[15px] animate-spin text-[var(--brand-primary)]" />;
  }
  if (status === 'succeeded') {
    return (
      <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[var(--color-surface-success-bg)] text-[var(--color-surface-success-text)]">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[var(--color-surface-danger-bg)] text-[var(--color-surface-danger-text)]">
      <X className="h-2.5 w-2.5" strokeWidth={3} />
    </span>
  );
}
