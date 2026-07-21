import React, { useMemo, useState } from 'react';
import { FileInput } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HomeFlowCard } from './HomeFlowCard';
import { HOME_SHOWCASE_TEMPLATES } from './homeShowcase';
import { getDocumentKind, type DocumentKind } from './documentKindStorage';
import type { HomeFlowCard as HomeFlowCardModel } from './homeTypes';

type RecentFilter = 'all' | DocumentKind;

const MAX_RECENT_FILES = 8;

interface HomeRecentFilesSectionProps {
  flows: HomeFlowCardModel[];
  onOpenFlow: (flowId: string) => void;
  onRenameFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
  onImportJSON: () => void;
  onOpenTemplates: () => void;
  onUseTemplate: (templateId: string) => void;
  onCreate: (kind: DocumentKind) => void;
}

export function HomeRecentFilesSection({
  flows,
  onOpenFlow,
  onRenameFlow,
  onDuplicateFlow,
  onDeleteFlow,
  onImportJSON,
  onOpenTemplates,
  onUseTemplate,
  onCreate,
}: HomeRecentFilesSectionProps): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<RecentFilter>('all');

  const visibleFlows = useMemo(() => {
    const matchingFlows =
      filter === 'all' ? flows : flows.filter((flow) => getDocumentKind(flow.id) === filter);
    return matchingFlows.slice(0, MAX_RECENT_FILES);
  }, [filter, flows]);

  function handleShowcase(kind: DocumentKind, templateId?: string): void {
    if (templateId) {
      onUseTemplate(templateId);
      return;
    }
    onCreate(kind);
  }

  return (
    <div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-[var(--brand-text)]">
          {t('home.recentFiles', 'Recent Files')}
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="inline-flex rounded-lg bg-[color-mix(in_srgb,var(--brand-secondary),transparent_90%)] p-0.5"
            role="tablist"
            aria-label={t('home.filterAria', 'Filter recent files')}
          >
            {(
              [
                ['all', t('home.filterAll', 'All')],
                ['chart', t('home.kind.chart', 'Flowchart')],
                ['workflow', t('home.kind.workflow', 'Workflow')],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                data-testid={`home-filter-${value}`}
                onClick={() => setFilter(value)}
                className={
                  filter === value
                    ? 'rounded-md bg-[var(--brand-surface)] px-3 py-1 text-xs font-semibold text-[var(--brand-text)] shadow-[0_1px_2px_rgba(16,24,40,0.10)]'
                    : 'rounded-md px-3 py-1 text-xs text-[var(--brand-secondary)]'
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            data-testid="home-import-file"
            onClick={onImportJSON}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] bg-[var(--brand-surface)] px-[11px] text-[12.5px] font-medium text-[var(--brand-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand-background),transparent_40%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
          >
            <FileInput className="h-3 w-3" strokeWidth={2} />
            {t('home.importFile', 'Import file')}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleFlows.map((flow) => (
          <HomeFlowCard
            key={flow.id}
            flow={flow}
            onOpen={() => onOpenFlow(flow.id)}
            onRename={() => onRenameFlow(flow.id)}
            onDuplicate={() => onDuplicateFlow(flow.id)}
            onDelete={() => onDeleteFlow(flow.id)}
          />
        ))}
      </div>

      {visibleFlows.length === 0 ? (
        <p className="mt-6 text-center text-sm text-[var(--brand-secondary)]">
          {t('home.noMatchingFiles', 'No files match this filter.')}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
        <span className="shrink-0 text-[12.5px] text-[var(--brand-secondary)]">
          {t('home.startFromTemplate', 'Start from a template')}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {HOME_SHOWCASE_TEMPLATES.map((item) => {
            const tone = item.kind === 'chart' ? '#3663C9' : '#6250C9';
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`home-pill-${item.id}`}
                onClick={() => handleShowcase(item.kind, item.templateId)}
                className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-[var(--color-brand-border)] bg-[var(--brand-surface)] px-3 text-[12.5px] font-medium text-[var(--brand-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand-background),transparent_40%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              >
                <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: tone }} />
                {t(item.titleKey)}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          data-testid="home-open-templates"
          onClick={onOpenTemplates}
          className="shrink-0 text-[12.5px] font-medium text-[var(--brand-primary)] transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:underline"
        >
          {t('home.allTemplates', 'All templates')}
        </button>
      </div>
    </div>
  );
}
