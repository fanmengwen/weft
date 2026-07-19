import React, { Suspense, lazy, useState } from 'react';
import { useFlowStore } from '../store';
import { useWorkspaceDocumentActions, useWorkspaceDocumentsState } from '@/store/documentHooks';
import { HomeDashboard, type HomeFlowCard } from './home/HomeDashboard';
import { HomeFilesView } from './home/HomeFilesView';
import { HomeFlowDeleteDialog, HomeFlowRenameDialog } from './home/HomeFlowDialogs';
import { HomeMCPView } from './home/HomeMCPView';
import { HomePlaceholderView } from './home/HomePlaceholderView';
import { HomeRunsView } from './home/HomeRunsView';
import { HomeSettingsView, type HomeSettingsTab } from './home/HomeSettingsView';
import { HomeSidebar } from './home/HomeSidebar';
import { HomeTemplatesView } from './home/HomeTemplatesView';
import { HomeTrashView } from './home/HomeTrashView';
import type { HomePageTab } from './home/homeTabs';
import { shouldShowWelcomeModal } from './home/welcomeModalState';
import {
  copyDocumentKind,
  removeDocumentKind,
  setDocumentKind,
  type DocumentKind,
} from './home/documentKindStorage';
import { purgeTrashedDocumentFromRepository } from '@/services/storage/localFirstRuntime';
import {
  useTrashedDocumentsState,
} from '@/store/documentHooks';

const LazyWelcomeModal = lazy(async () => {
  const module = await import('./WelcomeModal');
  return { default: module.WelcomeModal };
});

interface HomePageProps {
  onLaunch: (kind?: DocumentKind) => void;
  onLaunchWithTemplates: () => void;
  onLaunchWithTemplate: (templateId: string) => void;
  onLaunchWithAI: () => void;
  onImportJSON: () => void;
  onOpenFlow: (flowId: string) => void;
  activeTab?: HomePageTab;
  onSwitchTab?: (tab: HomePageTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLaunch,
  onLaunchWithTemplates,
  onLaunchWithTemplate,
  onLaunchWithAI,
  onImportJSON,
  onOpenFlow,
  activeTab: propActiveTab,
  onSwitchTab,
}) => {
  const { documents } = useWorkspaceDocumentsState();
  const { trashedDocuments } = useTrashedDocumentsState();
  const {
    renameDocument,
    deleteDocument,
    duplicateDocument,
    restoreDocument,
    purgeDocument,
  } = useWorkspaceDocumentActions();
  const hasWorkspaceDocuments = useFlowStore((state) => state.documents.length > 0);
  const [internalActiveTab, setInternalActiveTab] = useState<HomePageTab>('home');
  const [activeSettingsTab, setActiveSettingsTab] = useState<HomeSettingsTab>('general');
  const [flowPendingRename, setFlowPendingRename] = useState<HomeFlowCard | null>(null);
  const [flowPendingDelete, setFlowPendingDelete] = useState<HomeFlowCard | null>(null);
  const showWelcomeModal = shouldShowWelcomeModal();

  const activeTab = propActiveTab ?? internalActiveTab;
  const flows: HomeFlowCard[] = hasWorkspaceDocuments ? documents : [];

  function handleTabChange(tab: HomePageTab): void {
    if (onSwitchTab) {
      onSwitchTab(tab);
    } else {
      setInternalActiveTab(tab);
    }
  }

  function handleRenameFlow(flowId: string): void {
    const flow = flows.find((entry) => entry.id === flowId);
    if (!flow) {
      return;
    }
    setFlowPendingRename(flow);
  }

  function handleDeleteFlow(flowId: string): void {
    const flow = flows.find((entry) => entry.id === flowId);
    if (!flow) {
      return;
    }
    setFlowPendingDelete(flow);
  }

  function submitFlowRename(nextName: string): void {
    if (!flowPendingRename) {
      return;
    }
    const trimmedName = nextName.trim();
    if (!trimmedName || trimmedName === flowPendingRename.name) {
      setFlowPendingRename(null);
      return;
    }
    renameDocument(flowPendingRename.id, trimmedName);
    setFlowPendingRename(null);
  }

  function confirmFlowDelete(): void {
    if (!flowPendingDelete) {
      return;
    }
    // Soft-delete keeps documentKind so Trash/restore retain chart vs workflow badges.
    deleteDocument(flowPendingDelete.id);
    setFlowPendingDelete(null);
  }

  function handleRestoreFlow(documentId: string): void {
    restoreDocument(documentId);
  }

  function handlePurgeFlow(documentId: string): void {
    purgeDocument(documentId);
    removeDocumentKind(documentId);
    purgeTrashedDocumentFromRepository(documentId);
  }

  function handleDuplicateFlow(flowId: string): void {
    const newFlowId = duplicateDocument(flowId);
    if (newFlowId) {
      copyDocumentKind(flowId, newFlowId);
      onOpenFlow(newFlowId);
    }
  }

  function handleConvertToWorkflow(flowId: string): void {
    const newFlowId = duplicateDocument(flowId);
    if (!newFlowId) {
      return;
    }
    setDocumentKind(newFlowId, 'workflow');
    onOpenFlow(newFlowId);
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex flex-col text-[var(--brand-text)] md:flex-row">
      <HomeSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main
        id="main-content"
        className="flex min-w-0 flex-1 flex-col bg-[#F6F7F9] dark:bg-[var(--brand-background)] md:ml-[232px]"
      >
        {activeTab === 'home' && (
          <HomeDashboard
            flows={flows}
            onCreate={onLaunch}
            onOpenTemplates={onLaunchWithTemplates}
            onUseTemplate={onLaunchWithTemplate}
            onImportJSON={onImportJSON}
            onOpenFlow={onOpenFlow}
            onRenameFlow={handleRenameFlow}
            onDuplicateFlow={handleDuplicateFlow}
            onDeleteFlow={handleDeleteFlow}
          />
        )}

        {activeTab === 'files' && (
          <HomeFilesView
            flows={flows}
            onCreate={onLaunch}
            onOpenFlow={onOpenFlow}
            onRenameFlow={handleRenameFlow}
            onDuplicateFlow={handleDuplicateFlow}
            onDeleteFlow={handleDeleteFlow}
            onConvertToWorkflow={handleConvertToWorkflow}
          />
        )}

        {activeTab === 'templates' && (
          <HomeTemplatesView onUseTemplate={onLaunchWithTemplate} />
        )}

        {activeTab === 'runs' && <HomeRunsView onOpenFlow={onOpenFlow} />}

        {activeTab === 'trash' && (
          <HomeTrashView
            items={trashedDocuments}
            onRestore={handleRestoreFlow}
            onPurge={handlePurgeFlow}
          />
        )}

        {activeTab === 'account' && (
          <HomePlaceholderView
            testId="home-account-view"
            titleKey="nav.account"
            titleFallback="Account"
            descriptionKey="home.accountDescription"
            descriptionFallback="Account preferences will appear here."
          />
        )}

        {activeTab === 'mcp' && <HomeMCPView />}

        {activeTab === 'settings' && (
          <HomeSettingsView
            activeSettingsTab={activeSettingsTab}
            onSettingsTabChange={setActiveSettingsTab}
          />
        )}
      </main>
      <HomeFlowRenameDialog
        key={flowPendingRename?.id ?? 'rename-closed'}
        flowName={flowPendingRename?.name ?? ''}
        isOpen={flowPendingRename !== null}
        onClose={() => setFlowPendingRename(null)}
        onSubmit={submitFlowRename}
      />
      <HomeFlowDeleteDialog
        key={flowPendingDelete?.id ?? 'delete-closed'}
        flowName={flowPendingDelete?.name ?? ''}
        isOpen={flowPendingDelete !== null}
        onClose={() => setFlowPendingDelete(null)}
        onConfirm={confirmFlowDelete}
      />
      {showWelcomeModal ? (
        <Suspense fallback={null}>
          <LazyWelcomeModal
            onOpenTemplates={onLaunchWithTemplates}
            onPromptWithAI={onLaunchWithAI}
            onImport={onImportJSON}
            onBlankCanvas={() => onLaunch('chart')}
          />
        </Suspense>
      ) : null}
    </div>
  );
};
