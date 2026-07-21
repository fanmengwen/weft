import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentKind } from './documentKindStorage';
import { FilesPageHeader } from './files/FilesPageHeader';
import { FilesSection } from './files/FilesSection';
import { FilesTabBar } from './files/FilesTabBar';
import {
  filterFlowsByQuery,
  limitForAllTab,
  partitionFlowsByKind,
  sortFlowsByUpdatedAtDesc,
  type HomeFilesKindTab,
  type HomeFilesLayout,
} from './files/homeFilesModel';
import type { HomeFlowCard as HomeFlowCardModel } from './homeTypes';

interface HomeFilesViewProps {
  flows: HomeFlowCardModel[];
  onCreate: (kind?: DocumentKind) => void;
  onOpenFlow: (flowId: string) => void;
  onRenameFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
}

export function HomeFilesView({
  flows,
  onCreate,
  onOpenFlow,
  onRenameFlow,
  onDuplicateFlow,
  onDeleteFlow,
}: HomeFilesViewProps): React.ReactElement {
  const { t } = useTranslation();
  const [tab, setTab] = useState<HomeFilesKindTab>('all');
  const [layout, setLayout] = useState<HomeFilesLayout>('grid');
  const [query, setQuery] = useState('');

  const prepared = useMemo(() => {
    const filtered = sortFlowsByUpdatedAtDesc(filterFlowsByQuery(flows, query));
    return partitionFlowsByKind(filtered);
  }, [flows, query]);

  const isAll = tab === 'all';
  const showCharts = isAll || tab === 'chart';
  const showWorkflows = isAll || tab === 'workflow';
  const chartList = showCharts ? limitForAllTab(prepared.charts, isAll) : [];
  const workflowList = showWorkflows ? limitForAllTab(prepared.workflows, isAll) : [];
  const isEmpty =
    (showCharts ? prepared.charts.length === 0 : true) &&
    (showWorkflows ? prepared.workflows.length === 0 : true);

  return (
    <div
      className="flex-1 overflow-y-auto animate-in fade-in duration-300"
      data-testid="home-files-view"
    >
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-8 md:px-10 md:pb-16">
        <FilesPageHeader query={query} onQueryChange={setQuery} onCreate={onCreate} />
        <FilesTabBar
          tab={tab}
          onTabChange={setTab}
          layout={layout}
          onLayoutChange={setLayout}
        />

        {isEmpty ? (
          <p className="mt-10 text-sm text-[var(--brand-secondary)]" data-testid="files-empty">
            {query.trim()
              ? t('home.noMatchingFiles', 'No files match this filter.')
              : t('home.filesEmpty', 'No files yet. Create a flowchart or workflow from Home.')}
          </p>
        ) : (
          <>
            {showCharts ? (
              <FilesSection
                kind="chart"
                flows={chartList}
                totalCount={prepared.charts.length}
                layout={layout}
                showHeader={isAll}
                onViewAll={isAll ? () => setTab('chart') : undefined}
                onOpenFlow={onOpenFlow}
                onRenameFlow={onRenameFlow}
                onDuplicateFlow={onDuplicateFlow}
                onDeleteFlow={onDeleteFlow}
              />
            ) : null}
            {showWorkflows ? (
              <FilesSection
                kind="workflow"
                flows={workflowList}
                totalCount={prepared.workflows.length}
                layout={layout}
                showHeader={isAll}
                onViewAll={isAll ? () => setTab('workflow') : undefined}
                onOpenFlow={onOpenFlow}
                onRenameFlow={onRenameFlow}
                onDuplicateFlow={onDuplicateFlow}
                onDeleteFlow={onDeleteFlow}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
