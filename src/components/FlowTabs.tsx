import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import { useTranslation } from 'react-i18next';
import type { EditorPage } from '@/store/editorPageHooks';

interface FlowTabsProps {
  pages: EditorPage[];
  activePageId: string;
  onSwitchPage: (pageId: string) => void;
  onAddPage: () => void;
  onClosePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onReorderPage: (draggedPageId: string, targetPageId: string) => void;
}

export const FlowTabs: React.FC<FlowTabsProps> = ({
  pages,
  activePageId,
  onSwitchPage,
  onAddPage,
  onClosePage,
  onRenamePage,
  onReorderPage,
}) => {
  const { t } = useTranslation();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [dropTargetPageId, setDropTargetPageId] = useState<string | null>(null);
  // Canvas.dc.html page chip: h30, px16, r8, acc@9% fill + acc@22% border, 13/600.
  const activeTabClassName =
    'h-[30px] inline-flex items-center justify-center rounded-[8px] border border-[var(--wf-acc-border)] bg-[color-mix(in_srgb,var(--wf-acc)_9%,#FFFFFF)] px-4 text-[13px] font-semibold leading-none text-[var(--wf-acc)] transition-colors shrink-0 cursor-pointer select-none';
  const inactiveTabClassName =
    'h-[30px] inline-flex items-center justify-center rounded-[8px] border border-transparent px-4 text-[13px] font-medium leading-none text-[var(--wf-text-label)] transition-colors shrink-0 cursor-pointer select-none hover:bg-[var(--wf-hover)]';
  const canClosePage = pages.length > 1;

  const handleStartEdit = (page: EditorPage) => {
    setEditingTabId(page.id);
    setEditName(page.name);
  };

  const handleFinishEdit = () => {
    if (editingTabId && editName.trim()) {
      onRenamePage(editingTabId, editName.trim());
    }
    setEditingTabId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditName('');
    }
  };

  const handleDrop = (targetPageId: string): void => {
    if (!draggedPageId || draggedPageId === targetPageId) {
      setDraggedPageId(null);
      setDropTargetPageId(null);
      return;
    }

    onReorderPage(draggedPageId, targetPageId);
    setDraggedPageId(null);
    setDropTargetPageId(null);
  };

  return (
    <div className="pointer-events-auto flex min-w-0 items-center justify-center">
      <div
        role="tablist"
        className="flex max-w-full min-w-0 items-center gap-1.5 overflow-x-auto no-scrollbar"
      >
        {pages.map((page) => (
          <div
            key={page.id}
            data-testid="flow-page-tab"
            role="tab"
            tabIndex={activePageId === page.id ? 0 : -1}
            aria-selected={activePageId === page.id}
            className={`
              group relative
              ${dropTargetPageId === page.id && draggedPageId !== page.id ? 'ring-2 ring-[var(--wf-acc)] ring-offset-1 ring-offset-transparent' : ''}
              ${activePageId === page.id ? activeTabClassName : inactiveTabClassName}
            `}
            draggable={editingTabId !== page.id}
            onDragStart={() => setDraggedPageId(page.id)}
            onDragOver={(event) => {
              if (!draggedPageId || draggedPageId === page.id) {
                return;
              }
              event.preventDefault();
              setDropTargetPageId(page.id);
            }}
            onDragLeave={() => {
              if (dropTargetPageId === page.id) {
                setDropTargetPageId(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(page.id);
            }}
            onDragEnd={() => {
              setDraggedPageId(null);
              setDropTargetPageId(null);
            }}
            onClick={() => onSwitchPage(page.id)}
            onDoubleClick={() => handleStartEdit(page)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSwitchPage(page.id);
              }
            }}
            title={getFlowDisplayName(page.name, t)}
          >
            {editingTabId === page.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={handleKeyDown}
                className="w-24 rounded-[var(--radius-xs)] border border-[var(--wf-acc-border)] bg-[var(--brand-surface)] px-1 py-0 text-[13px] font-medium outline-none focus:ring-1 focus:ring-[var(--wf-acc)]"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="max-w-[96px] truncate sm:max-w-[120px]">
                {getFlowDisplayName(page.name, t)}
              </span>
            )}

            {canClosePage ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClosePage(page.id);
                }}
                title={t('flowTabs.closeTab', 'Close page')}
                className={`
                  -mr-1 rounded-full p-0.5 opacity-0 transition-colors group-hover:opacity-100
                  ${activePageId === page.id ? 'text-[var(--wf-acc)] hover:bg-[color-mix(in_srgb,var(--wf-acc)_12%,#fff)]' : 'text-[var(--wf-text-label)] hover:bg-[var(--wf-hover)]'}
                `}
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ))}

        <button
          type="button"
          onClick={onAddPage}
          data-testid="flow-page-add"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] text-[var(--wf-text-label)] transition-colors hover:bg-[var(--wf-hover)]"
          title={t('flowTabs.newFlowTab', 'New page')}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
