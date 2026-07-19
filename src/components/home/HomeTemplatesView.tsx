import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type FlowTemplate, getFlowTemplates } from '@/services/templates';
import {
  filterTemplatesByQuery,
  isFlowchartTemplate,
  isWorkflowTemplate,
  type TemplatesKindTab,
} from './templates/templateCatalog';
import { TemplatesPreviewDialog } from './templates/TemplatesPreviewDialog';
import { TemplatesSearchIcon } from './templates/TemplatesIcons';
import { TemplatesSection } from './templates/TemplatesSection';

interface HomeTemplatesViewProps {
  onUseTemplate: (templateId: string) => void;
}

export function HomeTemplatesView({
  onUseTemplate,
}: HomeTemplatesViewProps): React.ReactElement {
  const { t } = useTranslation();
  const allTemplates = useMemo(
    () => getFlowTemplates().filter((template) => template.featured),
    []
  );
  const [tab, setTab] = useState<TemplatesKindTab>('all');
  const [query, setQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null);

  const filtered = useMemo(
    () => filterTemplatesByQuery(allTemplates, query),
    [allTemplates, query]
  );
  const flowTemplates = useMemo(
    () => filtered.filter(isFlowchartTemplate),
    [filtered]
  );
  const workflowTemplates = useMemo(
    () => filtered.filter(isWorkflowTemplate),
    [filtered]
  );

  const showFlow = tab === 'all' || tab === 'flowchart';
  const showWorkflow = tab === 'all' || tab === 'workflow';

  const countLabel = useMemo(() => {
    if (tab === 'flowchart') {
      return t('homeTemplates.countFlow', {
        defaultValue: '{{count}} flowchart templates',
        count: flowTemplates.length,
      });
    }
    if (tab === 'workflow') {
      return t('homeTemplates.countWorkflow', {
        defaultValue: '{{count}} workflow templates',
        count: workflowTemplates.length,
      });
    }
    return t('homeTemplates.countTotal', {
      defaultValue: '{{count}} templates total',
      count: filtered.length,
    });
  }, [tab, flowTemplates.length, workflowTemplates.length, filtered.length, t]);

  const tabs: { id: TemplatesKindTab; label: string }[] = [
    { id: 'all', label: t('home.filterAll', 'All') },
    { id: 'flowchart', label: t('home.kind.chart', 'Flowchart') },
    { id: 'workflow', label: t('home.kind.workflow', 'Workflow') },
  ];

  return (
    <div
      className="flex-1 overflow-y-auto animate-in fade-in duration-300"
      data-testid="home-templates-view"
    >
      <div className="mx-auto max-w-[1040px] px-4 py-8 sm:px-8 md:px-10 md:pb-[72px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="m-0 text-[21px] font-bold tracking-tight text-[var(--brand-text)]">
              {t('nav.templates', 'Templates')}
            </h1>
            <p className="mt-[7px] max-w-[560px] text-[13px] leading-[1.6] text-[#6B7484] dark:text-[var(--brand-secondary)]">
              {t(
                'homeTemplates.description',
                'Ready-to-use flowcharts and workflows. Load a template onto the canvas with nodes, edges, and notes already in place—then make it yours.'
              )}
            </p>
          </div>
          <label className="mt-0.5 flex h-8 w-full max-w-[220px] shrink-0 items-center gap-[7px] rounded-lg border border-[#D8DCE2] bg-white px-2.5 dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)] sm:w-[220px]">
            <TemplatesSearchIcon />
            <span className="sr-only">{t('homeTemplates.search', 'Search templates')}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('homeTemplates.search', 'Search templates')}
              data-testid="templates-search"
              className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[var(--brand-text)] outline-none placeholder:text-[#9BA3AE]"
            />
          </label>
        </div>

        <div className="mt-[22px] flex items-end justify-between border-b border-[#E6E8EC] dark:border-[var(--color-brand-border)]">
          <div className="flex gap-5" role="tablist" aria-label={t('nav.templates', 'Templates')}>
            {tabs.map((entry) => {
              const active = tab === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`templates-tab-${entry.id}`}
                  onClick={() => setTab(entry.id)}
                  className={
                    active
                      ? '-mb-px border-b-2 border-[var(--brand-primary)] pb-[9px] text-[13.5px] font-semibold text-[var(--brand-text)]'
                      : '-mb-px border-b-2 border-transparent pb-[9px] text-[13.5px] text-[#6B7484] hover:text-[var(--brand-text)]'
                  }
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
          <div className="pb-[9px] text-xs text-[#98A1AE]" data-testid="templates-count-label">
            {countLabel}
          </div>
        </div>

        {showFlow ? (
          <TemplatesSection
            kind="flowchart"
            templates={flowTemplates}
            onOpenTemplate={setSelectedTemplate}
          />
        ) : null}
        {showWorkflow ? (
          <TemplatesSection
            kind="workflow"
            templates={workflowTemplates}
            onOpenTemplate={setSelectedTemplate}
          />
        ) : null}
      </div>

      {selectedTemplate ? (
        <TemplatesPreviewDialog
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUseTemplate={() => {
            const id = selectedTemplate.id;
            setSelectedTemplate(null);
            onUseTemplate(id);
          }}
        />
      ) : null}
    </div>
  );
}
