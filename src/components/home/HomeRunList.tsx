import React from 'react';
import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import type { HomeRunFilter } from './homeRunPresentation';
import { HomeRunListGroup } from './HomeRunListGroup';
import { HomeRunListHeader } from './HomeRunListHeader';

interface HomeRunListProps {
  groups: Array<{ name: string; records: WorkflowRunRecord[] }>;
  counts: Record<HomeRunFilter, number>;
  filter: HomeRunFilter;
  selectedId: string | null;
  onFilterChange: (filter: HomeRunFilter) => void;
  onSelect: (recordId: string) => void;
}

export function HomeRunList({ groups, counts, filter, selectedId, onFilterChange, onSelect }: HomeRunListProps): React.ReactElement {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-[var(--brand-border)] bg-[var(--brand-surface)] md:w-[340px] md:border-b-0 md:border-r">
      <HomeRunListHeader counts={counts} filter={filter} onFilterChange={onFilterChange} />
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-[var(--brand-border)] px-2.5 pb-3" data-testid="runs-list">
        {groups.map((group) => (
          <HomeRunListGroup key={group.name} group={group} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>
    </aside>
  );
}
