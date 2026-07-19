import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilesMoreIcon } from './FilesKindIcons';

interface FilesOverflowMenuProps {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function FilesOverflowMenu({
  onRename,
  onDuplicate,
  onDelete,
}: FilesOverflowMenuProps): React.ReactElement {
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

  function run(action: () => void): void {
    setOpen(false);
    action();
  }

  return (
    <div ref={rootRef} className="relative shrink-0" data-testid="files-overflow-menu">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('homeFiles.moreActions', 'More actions')}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="flex h-6 w-6 items-center justify-center rounded-md text-[#C6CCD6] transition-colors hover:bg-[#F0F2F5] hover:text-[#5C6572] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
      >
        <FilesMoreIcon />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 w-[132px] rounded-[10px] border border-[#E6E8EC] bg-white p-[5px] shadow-[0_4px_16px_rgba(16,24,40,0.10)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]"
        >
          <MenuItem label={t('common.rename', 'Rename')} onClick={() => run(onRename)} />
          <MenuItem label={t('common.duplicate', 'Duplicate')} onClick={() => run(onDuplicate)} />
          <MenuItem
            label={t('common.delete', 'Delete')}
            onClick={() => run(onDelete)}
            danger
          />
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex w-full items-center rounded-[7px] px-2 py-[7px] text-left text-[13px] font-medium transition-colors hover:bg-[#F3F5F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:hover:bg-[color-mix(in_srgb,var(--brand-background),white_6%)] ${
        danger ? 'text-red-600' : 'text-[var(--brand-text)]'
      }`}
    >
      {label}
    </button>
  );
}
