import React, { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_FLOW_NAME,
  getFlowDisplayName,
  isDefaultFlowName,
} from '@/lib/flowDisplayName';
import { useFlowStore } from '@/store';

export function TopNavDocumentName(): React.ReactElement | null {
  const { t } = useTranslation();
  const activeDocumentId = useFlowStore((state) => state.activeDocumentId);
  const documentName = useFlowStore((state) => {
    const id = state.activeDocumentId;
    if (!id) {
      return null;
    }
    return state.documents.find((document) => document.id === id)?.name ?? null;
  });
  const renameDocument = useFlowStore((state) => state.renameDocument);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!activeDocumentId || documentName === null) {
    return null;
  }

  const displayName = getFlowDisplayName(documentName, t);
  const isPlaceholder = !documentName.trim() || isDefaultFlowName(documentName);
  const renameLabel = t('nav.renameDocument', 'Rename');
  const placeholder = t('editor.untitled', { defaultValue: DEFAULT_FLOW_NAME });

  function startEdit(): void {
    cancelRef.current = false;
    setDraft(isDefaultFlowName(documentName) ? '' : documentName);
    setEditing(true);
  }

  function commitEdit(): void {
    if (cancelRef.current) {
      cancelRef.current = false;
      setEditing(false);
      return;
    }
    const next = draft.trim();
    if (next) {
      renameDocument(activeDocumentId, next);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitEdit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          } else if (event.key === 'Escape') {
            cancelRef.current = true;
            event.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        aria-label={renameLabel}
        data-testid="topnav-document-name-input"
        className="h-[30px] w-[220px] rounded-lg border border-[var(--wf-acc)] bg-white px-[9px] text-[13px] font-semibold text-[var(--wf-text)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--wf-acc)_14%,transparent)] outline-none placeholder:text-[#9BA3AE]"
      />
    );
  }

  return (
    <button
      type="button"
      title={renameLabel}
      aria-label={renameLabel}
      data-testid="topnav-document-name"
      onClick={startEdit}
      className="flex h-[30px] max-w-[240px] min-w-0 cursor-text items-center gap-[7px] rounded-lg px-2 transition-colors hover:bg-[#F3F5F8]"
    >
      <span
        className={[
          'truncate text-[13px] font-semibold',
          isPlaceholder ? 'text-[#9BA3AE]' : 'text-[var(--wf-text)]',
        ].join(' ')}
      >
        {displayName}
      </span>
      <Pencil className="h-3 w-3 shrink-0 text-[#B7BEC9]" strokeWidth={2} aria-hidden />
    </button>
  );
}
