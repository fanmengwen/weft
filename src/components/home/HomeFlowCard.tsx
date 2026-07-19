import React from 'react';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../Tooltip';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import { KindBadge } from './HomeExamplePreviews';
import { HomeFlowPreview } from './HomeFlowPreview';
import { getDocumentKind } from './documentKindStorage';
import type { HomeFlowCard as HomeFlowCardModel } from './homeTypes';

interface HomeFlowCardProps {
  flow: HomeFlowCardModel;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function HomeFlowCard({
  flow,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: HomeFlowCardProps): React.ReactElement {
  const { t } = useTranslation();
  const kind = getDocumentKind(flow.id);
  const kindLabel =
    kind === 'chart' ? t('home.kind.chart', 'Flowchart') : t('home.kind.workflow', 'Workflow');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] transition-all duration-150 hover:border-[color-mix(in_srgb,var(--color-brand-border),var(--brand-text)_12%)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)]"
    >
      <div className="relative h-[88px] overflow-hidden border-b border-[color-mix(in_srgb,var(--color-brand-border),transparent_20%)] bg-[#F6F7F9] dark:bg-[color-mix(in_srgb,var(--brand-background),white_4%)]">
        <HomeFlowPreview preview={flow.preview} />
        <div className="absolute right-2 top-2 z-20 flex items-center gap-0.5 rounded-full border border-[var(--color-brand-border)] bg-[var(--brand-surface)]/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <FlowCardActionButton
            label={t('common.rename', 'Rename')}
            onClick={onRename}
            hoverClassName="hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
          >
            <Pencil className="h-3 w-3" />
          </FlowCardActionButton>
          <FlowCardActionButton
            label={t('common.duplicate', 'Duplicate')}
            onClick={onDuplicate}
            hoverClassName="hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
          >
            <Copy className="h-3 w-3" />
          </FlowCardActionButton>
          <FlowCardActionButton
            label={t('common.delete', 'Delete')}
            onClick={onDelete}
            hoverClassName="hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </FlowCardActionButton>
        </div>
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="truncate text-[13px] font-semibold leading-snug text-[var(--brand-text)]">
          {getFlowDisplayName(flow.name, t)}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <KindBadge kind={kind} label={kindLabel} />
          <span className="text-[11.5px] text-[var(--brand-secondary)]">
            {formatUpdatedAt(flow.updatedAt, t)}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatUpdatedAt(
  updatedAt: string | undefined,
  t: (key: string, fallback: string) => string
): string {
  if (!updatedAt) {
    return t('home.autosaved', 'Autosaved');
  }
  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) {
    return t('home.autosaved', 'Autosaved');
  }
  return new Date(parsed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface FlowCardActionButtonProps {
  children: React.ReactNode;
  hoverClassName: string;
  label: string;
  onClick: () => void;
}

function FlowCardActionButton({
  children,
  hoverClassName,
  label,
  onClick,
}: FlowCardActionButtonProps): React.ReactElement {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onClick();
  }

  return (
    <Tooltip text={label} side="bottom">
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[var(--brand-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${hoverClassName}`}
      >
        {children}
      </button>
    </Tooltip>
  );
}
