import React from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateDiagramPreview } from '@/components/templates/TemplatePresentation';
import type { FlowTemplate } from '@/services/templates';
import {
  countDecisionNodes,
  countNodesByKind,
  isWorkflowTemplate,
} from './templateCatalog';
import { TemplatesEyeIcon, TemplatesPlusIcon } from './TemplatesIcons';

interface TemplatesHeroCardProps {
  template: FlowTemplate;
  onOpen: () => void;
}

export function TemplatesHeroCard({
  template,
  onOpen,
}: TemplatesHeroCardProps): React.ReactElement {
  const { t } = useTranslation();
  const isWorkflow = isWorkflowTemplate(template);
  const counts = countNodesByKind(template);
  const decisions = countDecisionNodes(template);
  const actionableNodes = template.nodes.filter((node) => node.type !== 'annotation').length;

  return (
    <div
      data-testid={`templates-hero-${template.id}`}
      className="mt-3 grid overflow-hidden rounded-[14px] border border-[#E6E8EC] bg-white transition-[box-shadow,border-color] duration-150 hover:border-[#D8DCE2] hover:shadow-[0_6px_18px_rgba(16,24,40,0.08)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)] lg:grid-cols-[minmax(0,600px)_1fr]"
    >
      <div className="relative h-[232px] overflow-hidden border-b border-[#EEF0F4] bg-[#F6F7F9] dark:border-[var(--color-brand-border)] dark:bg-[color-mix(in_srgb,var(--brand-background),white_3%)] lg:border-b-0 lg:border-r">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: 'radial-gradient(circle, #DEE1E7 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <span
          className={
            isWorkflow
              ? 'absolute left-3.5 top-[13px] z-[3] rounded-full bg-[#ECE9FA] px-[9px] py-[2.5px] text-[10.5px] font-semibold text-[#6250C9]'
              : 'absolute left-3.5 top-[13px] z-[3] rounded-full bg-[#E4EBFA] px-[9px] py-[2.5px] text-[10.5px] font-semibold text-[#3663C9]'
          }
        >
          {isWorkflow
            ? t('home.kind.workflow', 'Workflow')
            : t('home.kind.chart', 'Flowchart')}
        </span>
        <TemplateDiagramPreview template={template} density="hero" />
      </div>

      <div className="flex flex-col px-[22px] py-5">
        <span className="inline-flex self-start items-center rounded-full bg-[#F9EADC] px-[9px] py-[2.5px] text-[10.5px] font-semibold text-[#B05617]">
          {t('homeTemplates.featuredBadge', 'Featured')}
        </span>
        <h3 className="mt-[11px] text-[17px] font-bold tracking-tight text-[var(--brand-text)]">
          {template.name}
        </h3>
        <p className="mt-[7px] text-[12.5px] leading-[1.65] text-[#6B7484] dark:text-[var(--brand-secondary)]">
          {template.description}
        </p>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {counts.startEnd > 0 ? (
            <Chip dot="#1F7D4D" label={t('homeTemplates.chipStartEnd', 'Start / End')} />
          ) : null}
          {counts.decision > 0 ? (
            <Chip dot="#B05617" label={t('homeTemplates.chipDecision', 'Decision')} />
          ) : null}
          {counts.process > 0 ? (
            <Chip
              dot="#3663C9"
              label={t('homeTemplates.chipProcess', {
                defaultValue: 'Process ×{{count}}',
                count: counts.process,
              })}
            />
          ) : null}
        </div>

        <div className="mt-3 text-[11.5px] text-[#98A1AE]">
          {isWorkflow
            ? t('homeTemplates.metaWorkflow', {
                defaultValue: '{{nodes}} steps · {{branches}} branches · runnable',
                nodes: actionableNodes,
                branches: decisions,
              })
            : t('homeTemplates.metaFlow', {
                defaultValue: '{{nodes}} nodes · {{branches}} branches',
                nodes: actionableNodes,
                branches: decisions,
              })}
        </div>

        <div className="flex-1" />

        <div className="mt-[18px] flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid={`templates-hero-use-${template.id}`}
            onClick={onOpen}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-[15px] text-[13px] font-semibold text-white transition-[filter] hover:brightness-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
          >
            <TemplatesPlusIcon />
            {t('homeTemplates.useTemplate', 'Use template')}
          </button>
          <button
            type="button"
            data-testid={`templates-hero-preview-${template.id}`}
            onClick={onOpen}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#D8DCE2] bg-white px-[13px] text-[13px] font-medium text-[#4A5361] transition-colors hover:bg-[#F3F5F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)] dark:text-[var(--brand-secondary)]"
          >
            <TemplatesEyeIcon />
            {t('homeTemplates.preview', 'Preview')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ dot, label }: { dot: string; label: string }): React.ReactElement {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-[#E9EBEF] px-2 py-0.5 text-[10.5px] text-[#5C6572] dark:border-[var(--color-brand-border)] dark:text-[var(--brand-secondary)]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
      {label}
    </span>
  );
}
