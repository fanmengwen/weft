import React from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateDiagramPreview } from '@/components/templates/TemplatePresentation';
import type { FlowTemplate } from '@/services/templates';
import { isWorkflowTemplate, shortDescription } from './templateCatalog';
import { TemplatesArrowIcon } from './TemplatesIcons';

interface TemplatesGridCardProps {
  template: FlowTemplate;
  onOpen: () => void;
}

export function TemplatesGridCard({
  template,
  onOpen,
}: TemplatesGridCardProps): React.ReactElement {
  const { t } = useTranslation();
  const isWorkflow = isWorkflowTemplate(template);
  const actionableNodes = template.nodes.filter((node) => node.type !== 'annotation').length;

  return (
    <article
      data-testid={`templates-card-${template.id}`}
      className="overflow-hidden rounded-xl border border-[#E6E8EC] bg-white transition-[box-shadow,border-color] duration-150 hover:border-[#D8DCE2] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-[190px] w-full overflow-hidden border-b border-[#EEF0F4] bg-[#F6F7F9] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-primary)] dark:border-[var(--color-brand-border)]"
        aria-label={t('homeTemplates.previewNamed', 'Preview {{name}}', { name: template.name })}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #DEE1E7 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <TemplateDiagramPreview template={template} density="card" />
      </button>
      <div className="px-3.5 pb-[13px] pt-[11px]">
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-[13.5px] font-semibold text-[var(--brand-text)] hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:underline"
        >
          {template.name}
        </button>
        <p className="mt-1 text-[11.5px] leading-[1.5] text-[#8B93A0]">
          {shortDescription(template.description)}
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11px] text-[#98A1AE]">
            {isWorkflow
              ? t('homeTemplates.stepsCount', '{{count}} steps', { count: actionableNodes })
              : t('homeTemplates.nodes', '{{count}} nodes', { count: actionableNodes })}
          </span>
          <button
            type="button"
            data-testid={`templates-use-${template.id}`}
            onClick={onOpen}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--brand-primary)] transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:underline"
          >
            <span>{t('homeTemplates.use', 'Use')}</span>
            <TemplatesArrowIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
