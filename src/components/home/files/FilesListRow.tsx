import React from 'react';
import { useTranslation } from 'react-i18next';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import { getDocumentKind } from '../documentKindStorage';
import type { HomeFlowCard as HomeFlowCardModel } from '../homeTypes';
import { ChartKindIcon, WorkflowKindIcon } from './FilesKindIcons';
import { FilesOverflowMenu } from './FilesOverflowMenu';
import { formatRelativeUpdatedAt } from './formatRelativeUpdatedAt';

interface FilesListRowProps {
  flow: HomeFlowCardModel;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FilesListRow({
  flow,
  onOpen,
  onRename,
  onDelete,
}: FilesListRowProps): React.ReactElement {
  const { t } = useTranslation();
  const kind = getDocumentKind(flow.id);
  const isChart = kind === 'chart';
  const title = getFlowDisplayName(flow.name, t);
  const kindLabel = isChart
    ? t('home.kind.chart', 'Flowchart')
    : t('home.kind.workflow', 'Workflow');
  const relative = formatRelativeUpdatedAt(flow.updatedAt, (key, fallback, options) =>
    t(key, { defaultValue: fallback, ...options })
  );

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`files-row-${flow.id}`}
      data-kind={kind}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E6E8EC] bg-white px-3.5 py-3 transition-[box-shadow,border-color] duration-150 hover:border-[#D8DCE2] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]"
    >
      <span
        className={
          isChart
            ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E4EBFA] text-[#3663C9]'
            : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#ECE9FA] text-[#6250C9]'
        }
      >
        {isChart ? <ChartKindIcon size={14} /> : <WorkflowKindIcon size={14} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-[var(--brand-text)]">{title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] text-[#98A1AE]">
          <span>{kindLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{relative}</span>
          <span aria-hidden="true">·</span>
          <span>{t('homeFiles.nodeMeta', '{{count}} nodes', { count: flow.nodeCount })}</span>
        </div>
      </div>
      <FilesOverflowMenu onOpen={onOpen} onRename={onRename} onDelete={onDelete} />
    </div>
  );
}
