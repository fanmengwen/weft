import React, { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFlowDisplayName } from '@/lib/flowDisplayName';
import type { TrashedDocument } from '@/services/storage/flowDocumentModel';
import { Button } from '../ui/Button';
import { KindBadge } from './HomeExamplePreviews';
import { getDocumentKind } from './documentKindStorage';
import { HomeFlowDeleteDialog } from './HomeFlowDialogs';

interface HomeTrashViewProps {
  items: TrashedDocument[];
  onRestore: (documentId: string) => void;
  onPurge: (documentId: string) => void;
}

export function HomeTrashView({
  items,
  onRestore,
  onPurge,
}: HomeTrashViewProps): React.ReactElement {
  const { t } = useTranslation();
  const [pendingPurge, setPendingPurge] = useState<TrashedDocument | null>(null);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-300" data-testid="home-trash-view">
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-8 md:px-10 md:pb-16">
        <h1 className="m-0 text-[21px] font-bold tracking-tight text-[var(--brand-text)]">
          {t('nav.trash', 'Trash')}
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-secondary)]">
          {t(
            'home.trashPageDescription',
            'Deleted diagrams and workflows. Restore them or delete permanently.'
          )}
        </p>

        {items.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--brand-secondary)]" data-testid="home-trash-empty">
            {t('home.trashEmpty', 'Trash is empty.')}
          </p>
        ) : (
          <ul className="mt-6 flex list-none flex-col gap-2.5 p-0" data-testid="home-trash-list">
            {items.map((item) => {
              const kind = getDocumentKind(item.document.id);
              const kindLabel =
                kind === 'chart'
                  ? t('home.kind.chart', 'Flowchart')
                  : t('home.kind.workflow', 'Workflow');

              return (
                <li
                  key={item.document.id}
                  data-testid={`home-trash-item-${item.document.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-[var(--brand-text)]">
                      {getFlowDisplayName(item.document.name, t)}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <KindBadge kind={kind} label={kindLabel} />
                      <span className="text-[11.5px] text-[var(--brand-secondary)]">
                        {t('home.trash.deletedAt', 'Deleted {{date}}', {
                          date: formatDeletedAt(item.deletedAt),
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      data-testid={`home-trash-restore-${item.document.id}`}
                      onClick={() => onRestore(item.document.id)}
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      {t('home.trash.restore', 'Restore')}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      data-testid={`home-trash-purge-${item.document.id}`}
                      onClick={() => setPendingPurge(item)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      {t('home.trash.purge', 'Delete permanently')}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <HomeFlowDeleteDialog
        key={pendingPurge?.document.id ?? 'purge-closed'}
        flowName={pendingPurge?.document.name ?? ''}
        isOpen={pendingPurge !== null}
        mode="purge"
        onClose={() => setPendingPurge(null)}
        onConfirm={() => {
          if (!pendingPurge) {
            return;
          }
          onPurge(pendingPurge.document.id);
          setPendingPurge(null);
        }}
      />
    </div>
  );
}

function formatDeletedAt(deletedAt: string): string {
  const parsed = Date.parse(deletedAt);
  if (Number.isNaN(parsed)) {
    return deletedAt;
  }
  return new Date(parsed).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
