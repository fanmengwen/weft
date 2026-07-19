import React from 'react';
import { useTranslation } from 'react-i18next';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import { getDocumentKind } from '../documentKindStorage';
import type { HomeFlowCard as HomeFlowCardModel } from '../homeTypes';
import { FilesCompactPreview } from './FilesCompactPreview';
import { ChartKindIcon, FilesConvertIcon, WorkflowKindIcon } from './FilesKindIcons';
import { FilesOverflowMenu } from './FilesOverflowMenu';
import { formatRelativeUpdatedAt } from './formatRelativeUpdatedAt';

interface FilesGridCardProps {
  flow: HomeFlowCardModel;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onConvertToWorkflow?: () => void;
}

export function FilesGridCard({
  flow,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  onConvertToWorkflow,
}: FilesGridCardProps): React.ReactElement {
  const { t } = useTranslation();
  const kind = getDocumentKind(flow.id);
  const isChart = kind === 'chart';
  const title = getFlowDisplayName(flow.name, t);
  const relative = formatRelativeUpdatedAt(flow.updatedAt, (key, fallback, options) =>
    t(key, { defaultValue: fallback, ...options })
  );

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`files-card-${flow.id}`}
      data-kind={kind}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer rounded-xl border border-[#E6E8EC] bg-white p-3 transition-[box-shadow,border-color] duration-150 hover:border-[#D8DCE2] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]"
    >
      <div className="flex items-center gap-1.5">
        <span
          className={
            isChart
              ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#E4EBFA] text-[#3663C9]'
              : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#ECE9FA] text-[#6250C9]'
          }
        >
          {isChart ? <ChartKindIcon /> : <WorkflowKindIcon />}
        </span>
        <FilesCompactPreview kind={kind} preview={flow.preview} />
        <FilesOverflowMenu onRename={onRename} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>

      <div className="mt-2.5 truncate text-[13.5px] font-semibold text-[var(--brand-text)]">
        {title}
      </div>
      <div className="mt-1 text-[11.5px] text-[#98A1AE]">{relative}</div>

      {isChart && onConvertToWorkflow ? (
        <button
          type="button"
          data-testid={`files-convert-${flow.id}`}
          onClick={(event) => {
            event.stopPropagation();
            onConvertToWorkflow();
          }}
          className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--brand-primary)] transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:underline"
        >
          <FilesConvertIcon />
          {t('homeFiles.convertToWorkflow', 'Convert to workflow')}
        </button>
      ) : (
        <div className="mt-2.5 text-[12px] text-[#98A1AE]">
          {t('homeFiles.nodeMeta', '{{count}} nodes', { count: flow.nodeCount })}
        </div>
      )}
    </div>
  );
}
