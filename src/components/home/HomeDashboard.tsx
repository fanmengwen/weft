import React from 'react';
import { useTranslation } from 'react-i18next';
import { recordOnboardingEvent } from '@/services/onboarding/events';
import { HomeCapabilityCards } from './HomeCapabilityCards';
import { HomeNewUserSection } from './HomeNewUserSection';
import { HomeRecentFilesSection } from './HomeRecentFilesSection';
import type { DocumentKind } from './documentKindStorage';
import type { HomeFlowCard } from './homeTypes';

export type { HomeFlowCard } from './homeTypes';

interface HomeDashboardProps {
  flows: HomeFlowCard[];
  onCreate: (kind: DocumentKind) => void;
  onOpenTemplates: () => void;
  onUseTemplate: (templateId: string) => void;
  onImportJSON: () => void;
  onOpenFlow: (flowId: string) => void;
  onRenameFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
}

export function HomeDashboard({
  flows,
  onCreate,
  onOpenTemplates,
  onUseTemplate,
  onImportJSON,
  onOpenFlow,
  onRenameFlow,
  onDuplicateFlow,
  onDeleteFlow,
}: HomeDashboardProps): React.ReactElement {
  const { t } = useTranslation();
  const hasFlows = flows.length > 0;

  function handleCreate(kind: DocumentKind): void {
    recordOnboardingEvent('welcome_blank_selected', {
      source: kind === 'chart' ? 'home-dashboard-chart' : 'home-dashboard-workflow',
    });
    onCreate(kind);
  }

  function handleOpenTemplates(): void {
    recordOnboardingEvent('welcome_template_selected', { source: 'home-dashboard' });
    onOpenTemplates();
  }

  function handleUseTemplate(templateId: string): void {
    recordOnboardingEvent('welcome_template_selected', {
      source: 'home-dashboard',
      templateId,
    });
    onUseTemplate(templateId);
  }

  function handleImportJSON(): void {
    recordOnboardingEvent('welcome_import_selected', { source: 'home-dashboard' });
    onImportJSON();
  }

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-8 md:px-10 md:pb-16">
        <div className="flex items-center justify-between">
          <h1 className="m-0 text-[21px] font-bold tracking-tight text-[var(--brand-text)]">
            {t('home.title', 'Home')}
          </h1>
        </div>

        <HomeCapabilityCards onCreate={handleCreate} />

        {hasFlows ? (
          <HomeRecentFilesSection
            flows={flows}
            onOpenFlow={onOpenFlow}
            onRenameFlow={onRenameFlow}
            onDuplicateFlow={onDuplicateFlow}
            onDeleteFlow={onDeleteFlow}
            onImportJSON={handleImportJSON}
            onOpenTemplates={handleOpenTemplates}
            onUseTemplate={handleUseTemplate}
            onCreate={handleCreate}
          />
        ) : (
          <HomeNewUserSection
            onOpenTemplates={handleOpenTemplates}
            onUseTemplate={handleUseTemplate}
            onCreate={handleCreate}
          />
        )}
      </div>
    </div>
  );
}
