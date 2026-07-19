import React from 'react';
import { ChevronRight, Diamond, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DocumentKind } from './documentKindStorage';

interface HomeCapabilityCardsProps {
  onCreate: (kind: DocumentKind) => void;
}

export function HomeCapabilityCards({ onCreate }: HomeCapabilityCardsProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="mt-[18px] grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <CapabilityCard
        kind="chart"
        title={t('home.capability.chartTitle', 'Flowchart')}
        description={t(
          'home.capability.chartDescription',
          'Map structure and decision branches for people to read'
        )}
        iconBg="bg-[#E4EBFA] text-[#3663C9] dark:bg-[color-mix(in_srgb,#3663C9_22%,transparent)] dark:text-[#93b4f5]"
        onClick={() => onCreate('chart')}
        testId="home-create-chart"
      />
      <CapabilityCard
        kind="workflow"
        title={t('home.capability.workflowTitle', 'Workflow')}
        description={t(
          'home.capability.workflowDescription',
          'Orchestrate runnable steps that produce results'
        )}
        iconBg="bg-[#ECE9FA] text-[#6250C9] dark:bg-[color-mix(in_srgb,#6250C9_22%,transparent)] dark:text-[#b5a8f0]"
        onClick={() => onCreate('workflow')}
        testId="home-create-workflow"
      />
    </div>
  );
}

interface CapabilityCardProps {
  kind: DocumentKind;
  title: string;
  description: string;
  iconBg: string;
  onClick: () => void;
  testId: string;
}

function CapabilityCard({
  kind,
  title,
  description,
  iconBg,
  onClick,
  testId,
}: CapabilityCardProps): React.ReactElement {
  return (
    <button
      type="button"
      data-testid={testId}
      data-kind={kind}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] px-4 py-[15px] text-left transition-all duration-150 hover:border-[color-mix(in_srgb,var(--color-brand-border),var(--brand-text)_12%)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${iconBg}`}
      >
        {kind === 'chart' ? (
          <Diamond className="h-[19px] w-[19px]" strokeWidth={2} />
        ) : (
          <Sparkles className="h-[19px] w-[19px]" strokeWidth={2} fill="currentColor" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-tight text-[var(--brand-text)]">
          {title}
        </div>
        <div className="mt-0.5 text-[12.5px] text-[var(--brand-secondary)]">{description}</div>
      </div>
      <ChevronRight
        className="h-[15px] w-[15px] shrink-0 text-[color-mix(in_srgb,var(--brand-secondary),transparent_35%)] transition-transform group-hover:translate-x-0.5"
        strokeWidth={2.2}
      />
    </button>
  );
}
