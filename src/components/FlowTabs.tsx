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
  const activeTabClassName =
    'h-[30px] inline-flex items-center gap-2 rounded-[9px] border border-[var(--wf-acc-border)] bg-[color-mix(in_srgb,var(--wf-acc)_9%,#fff)] px-3 text-[13px] font-semibold text-[var(--wf-acc)] transition-colors shrink-0 cursor-pointer select-none';
  const inactiveTabClassName =
    'h-[30px] inline-flex items-center gap-2 rounded-[9px] border border-transparent px-3 text-[13px] font-medium text-[var(--brand-secondary)] transition-colors shrink-0 cursor-pointer select-none hover:bg-[#F3F5F8]';

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
    <div className="pointer-events-auto flex min-w-0 items-center justify-center px-2 sm:px-4">
      <div
        role="tablist"
        className="flex max-w-full min-w-0 items-center gap-1 overflow-x-auto no-scrollbar"
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClosePage(page.id);
              }}
              title={t('flowTabs.closeTab', 'Close page')}
              className={`
                rounded-full p-1 opacity-0 transition-colors group-hover:opacity-100
                ${activePageId === page.id ? 'text-[var(--wf-acc)] hover:bg-[color-mix(in_srgb,var(--wf-acc)_12%,#fff)]' : 'text-[var(--brand-secondary)]'}
              `}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          onClick={onAddPage}
          data-testid="flow-page-add"
          className="ml-1 flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-[#E6E8EC] bg-[#FFFFFF] text-[var(--brand-secondary)] transition-colors hover:bg-[#F3F5F8]"
          title={t('flowTabs.newFlowTab', 'New page')}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
