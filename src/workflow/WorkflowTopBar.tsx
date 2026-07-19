import React, { useCallback, useRef } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModeSelector } from '@/components/top-nav/ModeSelector';
import { APP_NAME } from '@/lib/brand';
import { useToast } from '@/components/ui/ToastContext';
import { parseWorkflowFile, serializeWorkflow } from './store/workflowFile';
import { useWorkflowRunStore } from './store/workflowRunStore';
import { useWorkflowStore } from './store/workflowStore';

interface WorkflowTopBarProps {
  onGoHome: () => void;
}

const TEXT_BUTTON_CLASS =
  'rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[var(--wf-text-btn)] transition-colors hover:bg-[var(--wf-hover)] disabled:cursor-not-allowed disabled:opacity-50';

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
    <div className="flex h-[52px] items-center justify-between gap-3 border-b border-[var(--wf-border)] bg-[var(--wf-surface)] px-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onGoHome}
          aria-label={t('workflowMode.home')}
          title={t('workflowMode.home')}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-[var(--wf-text-label)] transition-colors hover:bg-[var(--wf-hover)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onGoHome}
          aria-label={t('workflowMode.home')}
          title={t('workflowMode.home')}
          className="cursor-pointer rounded-lg px-1.5 py-1 text-[15px] font-semibold text-[var(--wf-text)] transition-colors hover:bg-[var(--wf-hover)] hover:text-[var(--wf-acc)] active:bg-[var(--wf-hover)]"
        >
          {APP_NAME}
        </button>
        <div className="mx-1.5 h-4 w-px shrink-0 bg-[var(--wf-border)]" />
        <ModeSelector variant="flat" />
      </div>
      <div className="flex shrink-0 items-center gap-1">
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
          className={TEXT_BUTTON_CLASS}
        >
          {t('workflowMode.io.import')}
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={!hasNodes || isRunning}
          className={TEXT_BUTTON_CLASS}
        >
          {t('workflowMode.io.export')}
        </button>
        <div className="mx-1.5 h-4 w-px bg-[var(--wf-border)]" />
        {isRunning ? (
          <button
            type="button"
            onClick={stopRun}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--wf-danger)] px-3.5 text-[13px] font-semibold text-[var(--wf-danger)] transition-colors hover:bg-[var(--wf-danger-soft)]"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--wf-danger)]" />
            {t('workflowMode.stop')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRun}
            data-testid="workflow-run"
            disabled={!hasNodes}
            title={hasNodes ? t('workflowMode.run') : t('workflowMode.runNeedsNodes')}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--wf-acc)] px-3.5 text-[13px] font-semibold text-white transition-[filter] hover:brightness-[0.94] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-3 w-3 fill-current" />
            {t('workflowMode.run')}
          </button>
        )}
      </div>
    </div>
  );
}
