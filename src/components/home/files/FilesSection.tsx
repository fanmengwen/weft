import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentKind } from '../documentKindStorage';
import type { HomeFlowCard as HomeFlowCardModel } from '../homeTypes';
import { FilesGridCard } from './FilesGridCard';
import { ChartKindIcon, WorkflowKindIcon } from './FilesKindIcons';
import { FilesListRow } from './FilesListRow';
import type { HomeFilesLayout } from './homeFilesModel';

interface FilesSectionProps {
  kind: DocumentKind;
  flows: HomeFlowCardModel[];
  totalCount: number;
  layout: HomeFilesLayout;
  showHeader: boolean;
  onViewAll?: () => void;
  onOpenFlow: (flowId: string) => void;
  onRenameFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
}

export function FilesSection({
  kind,
  flows,
  totalCount,
  layout,
  showHeader,
  onViewAll,
  onOpenFlow,
  onRenameFlow,
  onDeleteFlow,
}: FilesSectionProps): React.ReactElement | null {
  const { t } = useTranslation();
  if (flows.length === 0 && !showHeader) {
    return null;
  }
  if (flows.length === 0) {
    return null;
  }

  const isChart = kind === 'chart';
  const title = isChart
    ? t('homeFiles.sectionChart', 'Flowchart · {{count}}', { count: totalCount })
    : t('homeFiles.sectionWorkflow', 'Workflow · {{count}}', { count: totalCount });

  return (
    <section
      data-testid={`files-section-${kind}`}
      className={showHeader ? (isChart ? 'mt-[22px]' : 'mt-7') : 'mt-3'}
    >
      {showHeader ? (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-[7px]">
            <span className={isChart ? 'text-[#3663C9]' : 'text-[#6250C9]'}>
              {isChart ? <ChartKindIcon size={13} /> : <WorkflowKindIcon size={13} />}
            </span>
            <span className="text-[13.5px] font-semibold text-[var(--brand-text)]">{title}</span>
          </div>
          {onViewAll ? (
            <button
              type="button"
              data-testid={`files-view-all-${kind}`}
              onClick={onViewAll}
              className="text-[12.5px] font-medium text-[var(--brand-primary)] transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:underline"
            >
              {t('homeFiles.viewAll', 'View all')}
            </button>
          ) : null}
        </div>
      ) : null}

      {layout === 'grid' ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <FilesGridCard
              key={flow.id}
              flow={flow}
              onOpen={() => onOpenFlow(flow.id)}
              onRename={() => onRenameFlow(flow.id)}
              onDelete={() => onDeleteFlow(flow.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {flows.map((flow) => (
            <FilesListRow
              key={flow.id}
              flow={flow}
              onOpen={() => onOpenFlow(flow.id)}
              onRename={() => onRenameFlow(flow.id)}
              onDelete={() => onDeleteFlow(flow.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
