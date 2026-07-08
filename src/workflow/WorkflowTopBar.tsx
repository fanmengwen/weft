import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TopNavBrand } from '@/components/top-nav/TopNavBrand';
import { ModeSelector } from '@/components/top-nav/ModeSelector';
import { APP_NAME } from '@/lib/brand';
import { useToast } from '@/components/ui/ToastContext';
import { parseWorkflowFile, serializeWorkflow } from './store/workflowFile';
import { useWorkflowRunStore } from './store/workflowRunStore';
import { useWorkflowStore } from './store/workflowStore';

interface WorkflowTopBarProps {
  onGoHome: () => void;
}

export function WorkflowTopBar({ onGoHome }: WorkflowTopBarProps): React.ReactElement {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const hasNodes = useWorkflowStore((state) => state.workflowNodes.length > 0);
  const runStatus = useWorkflowRunStore((state) => state.runStatus);
  const startRun = useWorkflowRunStore((state) => state.startRun);
  const stopRun = useWorkflowRunStore((state) => state.stopRun);
  const importInputRef = useRef<HTMLInputElement>(null);
  const isRunning = runStatus === 'running';

  const handleRun = useCallback(() => {
    void startRun().then((ok) => {
      if (!ok) {
        addToast(t('workflowMode.runInvalid'), 'warning');
      }
    });
  }, [addToast, startRun, t]);

  const handleExport = useCallback(() => {
    const { workflowNodes, workflowEdges } = useWorkflowStore.getState();
    const blob = new Blob([serializeWorkflow(workflowNodes, workflowEdges)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'weft-workflow.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const { nodes, edges } = parseWorkflowFile(await file.text());
        const workflowStore = useWorkflowStore.getState();
        workflowStore.setWorkflowNodes(nodes);
        workflowStore.setWorkflowEdges(edges);
        workflowStore.setSelectedNodeId(null);
        useWorkflowRunStore.getState().clearRunState();
        addToast(t('workflowMode.io.importSucceeded'), 'success');
      } catch {
        addToast(t('workflowMode.io.importFailed'), 'error');
      }
    },
    [addToast, t]
  );

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onGoHome}
          aria-label={t('workflowMode.home')}
          title={t('workflowMode.home')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--brand-radius)] text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-glass-bg)] hover:text-[var(--brand-text)]"
        >
          ←
        </button>
        <TopNavBrand appName={APP_NAME} logoUrl={null} logoStyle="text" ui={{ showBeta: true }} />
        <ModeSelector />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleImport(file);
            }
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          disabled={isRunning}
          className="rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-glass-bg)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('workflowMode.io.import')}
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={!hasNodes || isRunning}
          className="rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-glass-bg)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('workflowMode.io.export')}
        </button>
        {isRunning ? (
          <button
            type="button"
            onClick={stopRun}
            className="inline-flex items-center gap-1.5 rounded-[var(--brand-radius)] border border-[var(--brand-danger,#ef4444)] px-4 py-2 text-sm font-semibold text-[var(--brand-danger,#ef4444)] transition-colors hover:bg-[var(--brand-danger,#ef4444)]/10"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--brand-danger,#ef4444)]" />
            {t('workflowMode.stop')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRun}
            disabled={!hasNodes}
            title={hasNodes ? t('workflowMode.run') : t('workflowMode.runNeedsNodes')}
            className="inline-flex items-center gap-1.5 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-on-primary)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            ▶ {t('workflowMode.run')}
          </button>
        )}
      </div>
    </div>
  );
}
