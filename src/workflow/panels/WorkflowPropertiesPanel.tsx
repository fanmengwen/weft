import React from 'react';
import { useTranslation } from 'react-i18next';
import { WORKFLOW_NODE_CATALOG } from '../nodes/nodeCatalog';
import type { WorkflowNodeData } from '../nodes/workflowNodeData';
import { DEFAULT_LLM_MODEL } from '../nodes/workflowNodeData';
import { useWorkflowStore } from '../store/workflowStore';

const LLM_MODEL_OPTIONS = ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet-latest'] as const;

export function WorkflowPropertiesPanel(): React.ReactElement {
  const { t } = useTranslation();
  const workflowNodes = useWorkflowStore((state) => state.workflowNodes);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const updateWorkflowNodeData = useWorkflowStore((state) => state.updateWorkflowNodeData);
  const deleteWorkflowNode = useWorkflowStore((state) => state.deleteWorkflowNode);

  const selectedNode = workflowNodes.find((node) => node.id === selectedNodeId);
  const data = selectedNode?.data as unknown as WorkflowNodeData | undefined;
  const meta = data ? WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === data.kind) : undefined;

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-3 border-l border-[var(--brand-border)] bg-[var(--brand-glass-bg)] p-4 backdrop-blur-[var(--brand-glass-blur)]">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--brand-secondary)]">
        {t('workflowMode.properties.title')}
      </h2>

      {!selectedNode || !data ? (
        <div className="flex flex-1 items-center justify-center rounded-[var(--brand-radius)] border border-dashed border-[var(--brand-border)] p-6 text-center">
          <p className="text-sm text-[var(--brand-secondary)]">{t('workflowMode.properties.empty')}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-2 rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--brand-radius)] text-lg"
              style={{ backgroundColor: `${meta?.accent ?? '#3b82f6'}1a` }}
            >
              {meta?.icon}
            </span>
            <div>
              <div className="text-sm font-semibold text-[var(--brand-text)]">
                {t(`workflowMode.nodes.${data.kind}.name`)}
              </div>
              <div className="text-xs text-[var(--brand-secondary)]">{data.label}</div>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--brand-text)]">
              {t('workflowMode.properties.labelField')}
            </span>
            <input
              type="text"
              value={data.label}
              onChange={(event) => updateWorkflowNodeData(selectedNode.id, { label: event.target.value })}
              className="rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]"
            />
          </label>

          {data.kind === 'textInput' ? (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[var(--brand-text)]">
                {t('workflowMode.properties.textField')}
              </span>
              <textarea
                value={data.text ?? ''}
                onChange={(event) => updateWorkflowNodeData(selectedNode.id, { text: event.target.value })}
                rows={5}
                className="resize-none rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]"
                placeholder={t('workflowMode.properties.textPlaceholder')}
              />
            </label>
          ) : null}

          {data.kind === 'llm' ? (
            <>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-[var(--brand-text)]">
                  {t('workflowMode.properties.modelField')}
                </span>
                <select
                  value={data.model ?? DEFAULT_LLM_MODEL}
                  onChange={(event) => updateWorkflowNodeData(selectedNode.id, { model: event.target.value })}
                  className="rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]"
                >
                  {LLM_MODEL_OPTIONS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-[var(--brand-text)]">
                  {t('workflowMode.properties.promptField')}
                </span>
                <textarea
                  value={data.prompt ?? ''}
                  onChange={(event) => updateWorkflowNodeData(selectedNode.id, { prompt: event.target.value })}
                  rows={5}
                  className="resize-none rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]"
                  placeholder={t('workflowMode.properties.promptPlaceholder')}
                />
              </label>
            </>
          ) : null}

          {data.kind === 'webSearch' ? (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[var(--brand-text)]">
                {t('workflowMode.properties.queryField')}
              </span>
              <input
                type="text"
                value={data.query ?? ''}
                onChange={(event) => updateWorkflowNodeData(selectedNode.id, { query: event.target.value })}
                className="rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]"
                placeholder={t('workflowMode.properties.queryPlaceholder')}
              />
            </label>
          ) : null}

          {data.kind === 'output' ? (
            <p className="text-sm text-[var(--brand-secondary)]">
              {t('workflowMode.properties.outputHint')}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => deleteWorkflowNode(selectedNode.id)}
            aria-label={t('workflowMode.properties.deleteAria')}
            className="mt-auto rounded-[var(--brand-radius)] border border-[var(--brand-danger,#ef4444)] px-3 py-2 text-sm font-medium text-[var(--brand-danger,#ef4444)] transition-colors hover:bg-[var(--brand-danger,#ef4444)]/10"
          >
            {t('workflowMode.properties.delete')}
          </button>
        </div>
      )}
    </aside>
  );
}
