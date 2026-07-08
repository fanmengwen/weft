import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createId } from '@/lib/id';
import { useToast } from '@/components/ui/ToastContext';
import { WORKFLOW_NODE_CATALOG } from '../nodes/nodeCatalog';
import type {
  WorkflowCondition,
  WorkflowConditionOperator,
  WorkflowNodeData,
} from '../nodes/workflowNodeData';
import { listUpstreamVariables } from '../graph/upstreamVariables';
import { BUILTIN_DOC_ID, useKnowledgeStore } from '../rag/documentStore';
import { useWorkflowRunStore } from '../store/workflowRunStore';
import { useWorkflowStore } from '../store/workflowStore';
import { WorkflowVariablePicker } from './WorkflowVariablePicker';

const FIELD_LABEL_CLASS = 'font-medium text-[var(--brand-text)]';
const INPUT_CLASS =
  'rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]';
const TEXTAREA_CLASS = `resize-none ${INPUT_CLASS}`;
const COMPACT_SELECT_CLASS =
  'rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2 py-1.5 text-xs text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]';

const CONDITION_OPERATORS: WorkflowConditionOperator[] = [
  'contains',
  'notContains',
  'equals',
  'regex',
];

export function WorkflowPropertiesPanel(): React.ReactElement {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const workflowNodes = useWorkflowStore((state) => state.workflowNodes);
  const workflowEdges = useWorkflowStore((state) => state.workflowEdges);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const updateWorkflowNodeData = useWorkflowStore((state) => state.updateWorkflowNodeData);
  const deleteWorkflowNode = useWorkflowStore((state) => state.deleteWorkflowNode);
  const documents = useKnowledgeStore((state) => state.documents);
  const addDocument = useKnowledgeStore((state) => state.addDocument);
  const runStatus = useWorkflowRunStore((state) => state.runStatus);
  const nodeRunStates = useWorkflowRunStore((state) => state.nodeRunStates);
  const lastRunOutputs = useWorkflowRunStore((state) => state.lastRunOutputs);
  const runSingleNode = useWorkflowRunStore((state) => state.runSingleNode);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const selectedNode = workflowNodes.find((node) => node.id === selectedNodeId);
  const data = selectedNode?.data as unknown as WorkflowNodeData | undefined;
  const meta = data ? WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === data.kind) : undefined;

  const patchNode = (patch: Partial<WorkflowNodeData>) => {
    if (selectedNode) {
      updateWorkflowNodeData(selectedNode.id, patch);
    }
  };

  const patchConditions = (conditions: WorkflowCondition[]) => {
    patchNode({ conditions });
  };

  const isBusy =
    runStatus === 'running' ||
    (selectedNode ? nodeRunStates[selectedNode.id] === 'running' : false);

  // The one-step-run input view mirrors what the handler will see: cached
  // outputs of the direct upstream nodes.
  const lastRunInputs: Record<string, unknown> = {};
  if (selectedNode) {
    for (const edge of workflowEdges) {
      if (edge.target === selectedNode.id && lastRunOutputs[edge.source]) {
        lastRunInputs[edge.source] = lastRunOutputs[edge.source];
      }
    }
  }
  const lastRunOutput = selectedNode ? lastRunOutputs[selectedNode.id] : undefined;

  const handleUpload = async (file: File) => {
    if (!/\.(txt|md)$/i.test(file.name)) {
      addToast(t('workflowMode.properties.knowledgeUploadInvalid'), 'warning');
      return;
    }
    const text = await file.text();
    const docId = addDocument(file.name, text);
    patchNode({ knowledgeDocId: docId });
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-l border-[var(--brand-border)] bg-[var(--brand-glass-bg)] p-4 backdrop-blur-[var(--brand-glass-blur)]">
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

          <button
            type="button"
            onClick={() => void runSingleNode(selectedNode.id)}
            disabled={isBusy}
            className="rounded-[var(--brand-radius)] border border-[var(--brand-primary)] px-3 py-2 text-sm font-medium text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-primary)]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ▶ {t('workflowMode.properties.runNode')}
          </button>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.labelField')}</span>
            <input
              type="text"
              value={data.label}
              onChange={(event) => patchNode({ label: event.target.value })}
              className={INPUT_CLASS}
            />
          </label>

          {data.kind === 'textInput' ? (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.textField')}</span>
              <textarea
                value={data.text ?? ''}
                onChange={(event) => patchNode({ text: event.target.value })}
                rows={5}
                className={TEXTAREA_CLASS}
                placeholder={t('workflowMode.properties.textPlaceholder')}
              />
            </label>
          ) : null}

          {data.kind === 'llm' ? (
            <>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.modelField')}</span>
                <input
                  type="text"
                  value={data.model ?? ''}
                  onChange={(event) => patchNode({ model: event.target.value })}
                  className={INPUT_CLASS}
                  placeholder={t('workflowMode.properties.modelFollowGlobal')}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className={FIELD_LABEL_CLASS}>
                  {t('workflowMode.properties.systemPromptField')}
                </span>
                <textarea
                  value={data.systemPrompt ?? ''}
                  onChange={(event) => patchNode({ systemPrompt: event.target.value })}
                  rows={3}
                  className={TEXTAREA_CLASS}
                  placeholder={t('workflowMode.properties.systemPromptPlaceholder')}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-center justify-between">
                  <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.promptField')}</span>
                  <WorkflowVariablePicker
                    nodeId={selectedNode.id}
                    onPick={(template) => patchNode({ prompt: (data.prompt ?? '') + template })}
                  />
                </span>
                <textarea
                  value={data.prompt ?? ''}
                  onChange={(event) => patchNode({ prompt: event.target.value })}
                  rows={5}
                  className={TEXTAREA_CLASS}
                  placeholder={t('workflowMode.properties.promptPlaceholder')}
                />
              </label>
            </>
          ) : null}

          {data.kind === 'webSearch' ? (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="flex items-center justify-between">
                <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.queryField')}</span>
                <WorkflowVariablePicker
                  nodeId={selectedNode.id}
                  onPick={(template) => patchNode({ query: (data.query ?? '') + template })}
                />
              </span>
              <input
                type="text"
                value={data.query ?? ''}
                onChange={(event) => patchNode({ query: event.target.value })}
                className={INPUT_CLASS}
                placeholder={t('workflowMode.properties.queryPlaceholder')}
              />
            </label>
          ) : null}

          {data.kind === 'knowledgeRetrieval' ? (
            <>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className={FIELD_LABEL_CLASS}>
                  {t('workflowMode.properties.knowledgeDocField')}
                </span>
                <select
                  value={data.knowledgeDocId ?? BUILTIN_DOC_ID}
                  onChange={(event) => patchNode({ knowledgeDocId: event.target.value })}
                  className={INPUT_CLASS}
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </label>
              <input
                ref={uploadInputRef}
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleUpload(file);
                  }
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="rounded-[var(--brand-radius)] border border-dashed border-[var(--brand-border)] px-3 py-2 text-sm text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)]"
              >
                {t('workflowMode.properties.knowledgeUpload')}
              </button>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className={FIELD_LABEL_CLASS}>
                  {t('workflowMode.properties.knowledgeTopKField')}
                </span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={data.knowledgeTopK ?? 3}
                  onChange={(event) => {
                    const parsed = Number.parseInt(event.target.value, 10);
                    patchNode({
                      knowledgeTopK: Number.isNaN(parsed) ? 3 : Math.min(10, Math.max(1, parsed)),
                    });
                  }}
                  className={INPUT_CLASS}
                />
              </label>
            </>
          ) : null}

          {data.kind === 'ifElse' ? (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className={FIELD_LABEL_CLASS}>
                  {t('workflowMode.properties.conditionsField')}
                </span>
                <select
                  value={data.conditionLogic ?? 'and'}
                  onChange={(event) =>
                    patchNode({ conditionLogic: event.target.value === 'or' ? 'or' : 'and' })
                  }
                  className={COMPACT_SELECT_CLASS}
                >
                  <option value="and">{t('workflowMode.properties.logicAnd')}</option>
                  <option value="or">{t('workflowMode.properties.logicOr')}</option>
                </select>
              </div>
              {(data.conditions ?? []).map((condition) => {
                const conditions = data.conditions ?? [];
                const patchCondition = (patch: Partial<WorkflowCondition>) =>
                  patchConditions(
                    conditions.map((entry) =>
                      entry.id === condition.id ? { ...entry, ...patch } : entry
                    )
                  );
                return (
                  <div
                    key={condition.id}
                    className="flex flex-col gap-1.5 rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-2"
                  >
                    <select
                      value={condition.variable}
                      onChange={(event) => patchCondition({ variable: event.target.value })}
                      aria-label={t('workflowMode.properties.conditionVariable')}
                      className={COMPACT_SELECT_CLASS}
                    >
                      <option value="">{t('workflowMode.properties.conditionUpstream')}</option>
                      {listUpstreamVariables(selectedNode.id, workflowNodes, workflowEdges).map(
                        (option) => (
                          <option key={option.selector} value={option.selector}>
                            {option.nodeLabel} · {option.key}
                          </option>
                        )
                      )}
                    </select>
                    <div className="flex gap-1.5">
                      <select
                        value={condition.operator}
                        onChange={(event) =>
                          patchCondition({
                            operator: event.target.value as WorkflowConditionOperator,
                          })
                        }
                        aria-label={t('workflowMode.properties.conditionOperator')}
                        className={`${COMPACT_SELECT_CLASS} min-w-0 flex-1`}
                      >
                        {CONDITION_OPERATORS.map((operator) => (
                          <option key={operator} value={operator}>
                            {t(`workflowMode.properties.conditionOp.${operator}`)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(event) => patchCondition({ value: event.target.value })}
                        aria-label={t('workflowMode.properties.conditionValue')}
                        placeholder={t('workflowMode.properties.conditionValue')}
                        className={`${COMPACT_SELECT_CLASS} min-w-0 flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patchConditions(conditions.filter((entry) => entry.id !== condition.id))
                        }
                        aria-label={t('workflowMode.properties.removeCondition')}
                        title={t('workflowMode.properties.removeCondition')}
                        className="shrink-0 rounded-[var(--brand-radius)] px-2 text-[var(--brand-secondary)] transition-colors hover:text-[var(--brand-danger,#ef4444)]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  patchConditions([
                    ...(data.conditions ?? []),
                    { id: createId('wf-cond'), variable: '', operator: 'contains', value: '' },
                  ])
                }
                className="rounded-[var(--brand-radius)] border border-dashed border-[var(--brand-border)] px-3 py-2 text-sm text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)]"
              >
                + {t('workflowMode.properties.addCondition')}
              </button>
              <p className="text-xs text-[var(--brand-secondary)]">
                {t('workflowMode.properties.ifElseHint')}
              </p>
            </div>
          ) : null}

          {data.kind === 'code' ? (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.codeField')}</span>
              <textarea
                value={data.code ?? ''}
                onChange={(event) => patchNode({ code: event.target.value })}
                rows={8}
                spellCheck={false}
                className={`${TEXTAREA_CLASS} font-mono text-xs`}
              />
              <span className="text-xs text-[var(--brand-secondary)]">
                {t('workflowMode.properties.codeHint')}
              </span>
            </label>
          ) : null}

          {data.kind === 'output' ? (
            <p className="text-sm text-[var(--brand-secondary)]">
              {t('workflowMode.properties.outputHint')}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5 text-sm">
            <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.lastRun')}</span>
            {lastRunOutput === undefined && Object.keys(lastRunInputs).length === 0 ? (
              <p className="text-xs text-[var(--brand-secondary)]">
                {t('workflowMode.properties.lastRunEmpty')}
              </p>
            ) : (
              <>
                {Object.keys(lastRunInputs).length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--brand-secondary)]">
                      {t('workflowMode.properties.lastRunInput')}
                    </span>
                    <pre className="max-h-32 overflow-auto rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-2 text-[11px] leading-relaxed text-[var(--brand-text)]">
                      {JSON.stringify(lastRunInputs, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {lastRunOutput !== undefined ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--brand-secondary)]">
                      {t('workflowMode.properties.lastRunOutput')}
                    </span>
                    <pre className="max-h-32 overflow-auto rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-2 text-[11px] leading-relaxed text-[var(--brand-text)]">
                      {JSON.stringify(lastRunOutput, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </>
            )}
          </div>

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
