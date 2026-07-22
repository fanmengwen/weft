import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import { useWorkflowRunHistoryStore } from '@/workflow/history/workflowRunHistoryStore';
import { getDocumentKind } from '../documentKindStorage';
import type { HomeFlowCard as HomeFlowCardModel } from '../homeTypes';
import { FilesCompactPreview } from './FilesCompactPreview';
import { getLatestRunStatus } from './homeFilesModel';
import { HomeWorkflowDisableDialog } from './HomeWorkflowDisableDialog';
import { ChartKindIcon, WorkflowKindIcon } from './FilesKindIcons';
import { FilesOverflowMenu } from './FilesOverflowMenu';
import { formatRelativeUpdatedAt } from './formatRelativeUpdatedAt';
import { useWorkflowEnabledToggle } from './useWorkflowEnabledToggle';

interface FilesGridCardProps {
  flow: HomeFlowCardModel;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FilesGridCard({
  flow,
  onOpen,
  onRename,
  onDelete,
}: FilesGridCardProps): React.ReactElement {
  const { t } = useTranslation();
  const kind = getDocumentKind(flow.id);
  const isChart = kind === 'chart';
  const isWorkflow = kind === 'workflow';
  const title = getFlowDisplayName(flow.name, t);
  const relative = formatRelativeUpdatedAt(flow.updatedAt, (key, fallback, options) =>
    t(key, { defaultValue: fallback, ...options })
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { enabled, requestToggle, pendingDisable, confirmDisable, cancelDisable } =
    useWorkflowEnabledToggle(flow.id);
  const runRecords = useWorkflowRunHistoryStore((state) => state.records);
  const latestRun = isWorkflow ? getLatestRunStatus(flow.id, runRecords) : undefined;

  return (
    <>
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
        className="group cursor-pointer rounded-xl border border-[#E6E8EC] bg-white p-3 transition-[box-shadow,border-color] duration-150 hover:border-[#D8DCE2] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]"
      >
        <div className="relative flex items-center gap-1.5">
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
          <FilesOverflowMenu
            onOpen={onOpen}
            secondaryAction={
              isWorkflow
                ? {
                    label: enabled
                      ? t('homeFiles.workflowMenu.disable', 'Disable')
                      : t('homeFiles.workflowMenu.enable', 'Enable'),
                    onClick: requestToggle,
                  }
                : undefined
            }
            onRename={onRename}
            onDelete={onDelete}
            onOpenChange={setIsMenuOpen}
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[var(--brand-primary)] px-[18px] py-[7px] text-[12.5px] font-semibold text-white opacity-0 shadow-[0_2px_8px_rgba(16,24,40,0.18)] transition-opacity duration-[120ms] ${
              isMenuOpen ? '' : 'group-hover:opacity-100'
            }`}
          >
            {t('common.open', 'Open')}
          </span>
        </div>

        <div className="mt-2.5 truncate text-[13.5px] font-semibold text-[var(--brand-text)]">
          {title}
        </div>
        <div className="mt-1 text-[11.5px] text-[#98A1AE]">{relative}</div>

        {isWorkflow ? (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E1E4EA] px-[9px] py-[3px] text-[11.5px] font-medium text-[#3C4552]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-[#1F7D4D]' : 'bg-[#C3C9D3]'}`}
              />
              <span>
                {enabled
                  ? t('homeFiles.workflowStatus.enabled', 'Enabled')
                  : t('homeFiles.workflowStatus.disabled', 'Disabled')}
                {' · '}
                {t('homeFiles.workflowStatus.manual', 'Manual')}
              </span>
            </span>
            {latestRun ? (
              <span className="shrink-0 text-[11.5px] text-[#98A1AE]">
                {t('homeFiles.lastRun.label', 'Last run')}{' '}
                <span
                  className={
                    latestRun === 'succeeded'
                      ? 'font-semibold text-[#1F7D4D]'
                      : 'font-semibold text-[#C4443C]'
                  }
                >
                  {latestRun === 'succeeded'
                    ? t('common.success', 'Success')
                    : t('homeFiles.lastRun.failed', 'Failed')}
                </span>
              </span>
            ) : null}
          </div>
        ) : (
          <div className="mt-2.5 text-[12px] text-[#98A1AE]">
            {t('homeFiles.nodeMeta', '{{count}} nodes', { count: flow.nodeCount })}
          </div>
        )}
      </div>
      <HomeWorkflowDisableDialog
        flowName={flow.name}
        isOpen={pendingDisable}
        onClose={cancelDisable}
        onConfirm={confirmDisable}
      />
    </>
  );
}
