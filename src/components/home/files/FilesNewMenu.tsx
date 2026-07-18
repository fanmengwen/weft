import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentKind } from '../documentKindStorage';
import { ChartKindIcon, WorkflowKindIcon } from './FilesKindIcons';

interface FilesNewMenuProps {
  onCreate: (kind: DocumentKind) => void;
}

export function FilesNewMenu({ onCreate }: FilesNewMenuProps): React.ReactElement {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function handleCreate(kind: DocumentKind): void {
    setOpen(false);
    onCreate(kind);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        data-testid="files-new-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 text-[13px] font-semibold text-white transition-[filter] hover:brightness-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 5 V19 M5 12 H19"
            stroke="currentColor"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        {t('homeFiles.new', 'New')}
        <svg width="11" height="11" viewBox="0 0 24 24" className="opacity-80" aria-hidden="true">
          <path
            d="M6.5 9.5 L12 15 L17.5 9.5"
            stroke="currentColor"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          data-testid="files-new-menu"
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-[168px] rounded-[10px] border border-[#E6E8EC] bg-white p-[5px] shadow-[0_4px_16px_rgba(16,24,40,0.10)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]"
        >
          <NewMenuItem
            kind="chart"
            label={t('home.kind.chart', 'Flowchart')}
            onClick={() => handleCreate('chart')}
          />
          <NewMenuItem
            kind="workflow"
            label={t('home.kind.workflow', 'Workflow')}
            onClick={() => handleCreate('workflow')}
          />
        </div>
      ) : null}
    </div>
  );
}

function NewMenuItem({
  kind,
  label,
  onClick,
}: {
  kind: DocumentKind;
  label: string;
  onClick: () => void;
}): React.ReactElement {
  const isChart = kind === 'chart';
  return (
    <button
      type="button"
      role="menuitem"
      data-testid={`files-new-${kind}`}
      onClick={onClick}
      className="flex w-full items-center gap-[9px] rounded-[7px] px-2 py-[7px] text-left text-[13px] font-medium text-[var(--brand-text)] transition-colors hover:bg-[#F3F5F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:hover:bg-[color-mix(in_srgb,var(--brand-background),white_6%)]"
    >
      <span
        className={
          isChart
            ? 'flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#E4EBFA] text-[#3663C9]'
            : 'flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#ECE9FA] text-[#6250C9]'
        }
      >
        {isChart ? <ChartKindIcon /> : <WorkflowKindIcon />}
      </span>
      {label}
    </button>
  );
}
