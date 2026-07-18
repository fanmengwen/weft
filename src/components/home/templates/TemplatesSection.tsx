import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FlowTemplate } from '@/services/templates';
import { splitHeroAndRest } from './templateCatalog';
import { TemplatesChartIcon, TemplatesWorkflowIcon } from './TemplatesIcons';
import { TemplatesGridCard } from './TemplatesGridCard';
import { TemplatesHeroCard } from './TemplatesHeroCard';

interface TemplatesSectionProps {
  kind: 'flowchart' | 'workflow';
  templates: FlowTemplate[];
  onOpenTemplate: (template: FlowTemplate) => void;
}

export function TemplatesSection({
  kind,
  templates,
  onOpenTemplate,
}: TemplatesSectionProps): React.ReactElement {
  const { t } = useTranslation();
  const isFlow = kind === 'flowchart';
  const { hero, rest } = splitHeroAndRest(templates);
  const title = isFlow
    ? t('homeTemplates.sectionFlow', 'Flowchart templates')
    : t('homeTemplates.sectionWorkflow', 'Workflow templates');
  const empty = isFlow
    ? t('homeTemplates.emptyFlow', 'No flowchart templates match your search.')
    : t('homeTemplates.emptyWorkflow', 'No workflow templates match your search.');

  return (
    <section
      data-testid={`templates-section-${kind}`}
      className={isFlow ? 'mt-[26px]' : 'mt-[30px]'}
    >
      <div className="flex items-center gap-[7px]">
        <span className={isFlow ? 'text-[#3663C9]' : 'text-[#6250C9]'}>
          {isFlow ? <TemplatesChartIcon /> : <TemplatesWorkflowIcon />}
        </span>
        <span className="text-sm font-semibold text-[var(--brand-text)]">{title}</span>
        <span className="rounded-full bg-[#F0F2F5] px-2 py-px text-[11px] font-semibold text-[#8B93A0] dark:bg-[color-mix(in_srgb,var(--brand-secondary)_18%,transparent)]">
          {templates.length}
        </span>
      </div>

      {templates.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--brand-secondary)]" data-testid={`templates-empty-${kind}`}>
          {empty}
        </p>
      ) : (
        <>
          {hero ? <TemplatesHeroCard template={hero} onOpen={() => onOpenTemplate(hero)} /> : null}
          {rest.length > 0 ? (
            <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((template) => (
                <TemplatesGridCard
                  key={template.id}
                  template={template}
                  onOpen={() => onOpenTemplate(template)}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
