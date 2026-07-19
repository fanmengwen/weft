import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkflowRunHistoryStore } from '@/workflow/history/workflowRunHistoryStore';
import { HomeRunDetails } from './HomeRunDetails';
import { HomeRunList } from './HomeRunList';
import {
  groupRunRecords,
  matchesRunFilter,
  type HomeRunFilter,
} from './homeRunPresentation';

interface HomeRunsViewProps {
  onOpenFlow: (flowId: string) => void;
}

function HomeRunsEmpty(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className="m-auto px-6 py-16 text-center" data-testid="runs-empty">
      <p className="font-semibold text-[var(--brand-text)]">{t('homeRuns.emptyTitle')}</p>
      <p className="mt-2 text-sm text-[var(--brand-secondary)]">{t('homeRuns.emptyDescription')}</p>
    </div>
  );
}

function HomeRunsFilterEmpty(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-[var(--brand-secondary)]">
      {t('homeRuns.filterEmpty')}
    </div>
  );
}

export function HomeRunsView({ onOpenFlow }: HomeRunsViewProps): React.ReactElement {
  const records = useWorkflowRunHistoryStore((state) => state.records);
  const reload = useWorkflowRunHistoryStore((state) => state.reload);
  const removeRecord = useWorkflowRunHistoryStore((state) => state.removeRecord);
  const [filter, setFilter] = useState<HomeRunFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => reload(), [reload]);

  const filteredRecords = useMemo(
    () => records.filter((record) => matchesRunFilter(record, filter)),
    [filter, records]
  );
  const groups = useMemo(() => groupRunRecords(filteredRecords), [filteredRecords]);
  const selected =
    filteredRecords.find((record) => record.id === selectedId) ?? filteredRecords[0] ?? null;
  const counts: Record<HomeRunFilter, number> = {
    all: records.length,
    succeeded: records.filter((record) => record.status === 'succeeded').length,
    failed: records.filter((record) => matchesRunFilter(record, 'failed')).length,
    running: 0,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:h-screen md:flex-row" data-testid="home-runs-view">
      {records.length === 0 ? (
        <HomeRunsEmpty />
      ) : (
        <>
          <HomeRunList
            groups={groups}
            counts={counts}
            filter={filter}
            selectedId={selected?.id ?? null}
            onFilterChange={setFilter}
            onSelect={setSelectedId}
          />
          {selected ? (
            <HomeRunDetails record={selected} onOpenFlow={onOpenFlow} onDelete={removeRecord} />
          ) : (
            <HomeRunsFilterEmpty />
          )}
        </>
      )}
    </div>
  );
}
