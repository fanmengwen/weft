import React from 'react';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { HomeRunListCard } from './HomeRunListCard';

interface HomeRunListGroupProps {
  group: { name: string; records: WorkflowRunRecord[] };
  selectedId: string | null;
  onSelect: (recordId: string) => void;
}

export function HomeRunListGroup({ group, selectedId, onSelect }: HomeRunListGroupProps): React.ReactElement {
  return (
    <section>
      <div className="flex items-center gap-2 px-1.5 pb-2 pt-3.5">
        <h2 className="truncate text-[11.5px] font-semibold text-[var(--brand-secondary)]">{group.name}</h2>
        <span className="rounded-full bg-[var(--brand-background)] px-2 py-0.5 text-[10.5px] text-[var(--brand-secondary)]">{group.records.length}</span>
      </div>
      <div className="space-y-1.5">
        {group.records.map((record) => (
          <HomeRunListCard key={record.id} record={record} selected={record.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
