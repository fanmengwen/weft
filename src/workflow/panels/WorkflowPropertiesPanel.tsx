import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, Link, Play, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createId } from '@/lib/id';
import { useToast } from '@/components/ui/ToastContext';
import { useFlowStore } from '@/store';
import { DEFAULT_MODELS } from '@/config/aiProviders';
import { WORKFLOW_NODE_CATALOG, workflowToneStyle } from '../nodes/nodeCatalog';
import { WorkflowNodeIcon } from '../nodes/WorkflowNodeIcon';
import type {
  WorkflowCondition,
  WorkflowConditionOperator,
  WorkflowNodeData,
} from '../nodes/workflowNodeData';
import { listUpstreamVariables } from '../graph/upstreamVariables';
import { CODE_TIMEOUT_MS } from '../handlers/code';
import { BUILTIN_DOC_ID, useKnowledgeStore } from '../rag/documentStore';
import { useWorkflowRunStore } from '../store/workflowRunStore';
import { useWorkflowStore } from '../store/workflowStore';
import { WorkflowVariablePicker } from './WorkflowVariablePicker';

const SECTION_HEADER_CLASS = 'mb-2.5 mt-4 text-[11px] tracking-[0.05em] text-[var(--wf-text-faint)]';
const FIELD_LABEL_CLASS = 'text-xs font-medium text-[var(--wf-text-label)]';
const FOCUS_RING_CLASS =
  'outline-none transition-shadow focus:border-[var(--wf-acc)] focus:shadow-[0_0_0_3px_var(--wf-acc-focus)]';
const INPUT_CLASS = `h-[34px] w-full rounded-lg border border-[var(--wf-input-border)] bg-white px-2.5 text-[13px] text-[var(--wf-text)] placeholder:text-[var(--wf-placeholder)] ${FOCUS_RING_CLASS}`;
const TEXTAREA_CLASS = `min-h-[84px] w-full resize-y rounded-lg border border-[var(--wf-input-border)] bg-white px-2.5 py-2 text-[13px] leading-normal text-[var(--wf-text)] placeholder:text-[var(--wf-placeholder)] ${FOCUS_RING_CLASS}`;
const COMPACT_SELECT_CLASS = `rounded-[7px] border border-[var(--wf-input-border)] bg-white px-2 py-1.5 text-xs text-[var(--wf-text)] outline-none focus:border-[var(--wf-acc)]`;
const DASHED_BUTTON_CLASS =
  'rounded-lg border border-dashed border-[var(--wf-input-border)] px-3 py-2 text-[13px] text-[var(--wf-text-muted)] transition-colors hover:border-[var(--wf-acc)] hover:text-[var(--wf-text)]';
const META_PILL_CLASS =
  'rounded-md bg-[#F5F7FB] px-2 py-0.5 font-mono text-[11px] text-[#4A5361]';
const REF_PILL_CLASS =
  'rounded-md bg-[color-mix(in_srgb,var(--wf-acc)_8%,#fff)] px-2 py-0.5 font-mono text-[11px] text-[var(--wf-acc)]';

const MODEL_CUSTOM_OPTION = '__custom__';

const CONDITION_OPERATORS: WorkflowConditionOperator[] = [
  'isNotEmpty',
  'isEmpty',
  'contains',
  'notContains',
  'equals',
  'regex',
];

const OPERATORS_WITHOUT_VALUE: ReadonlySet<WorkflowConditionOperator> = new Set([
  'isNotEmpty',
  'isEmpty',
]);

function SectionDivider(): React.ReactElement {
  return <div className="-mx-4 mt-[18px] border-t border-[var(--wf-divider)]" />;
}

// One endpoint line inside the edge panel's source/target card.
function EdgeEndpointRow({
  data,
  role,
}: {
  data: WorkflowNodeData | undefined;
  role: string;
}): React.ReactElement {
  const meta = data ? WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === data.kind) : undefined;
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]"
        style={meta ? workflowToneStyle(meta.tone) : undefined}
      >
        {data ? <WorkflowNodeIcon kind={data.kind} className="h-3.5 w-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--wf-text)]">
        {data?.label}
      </span>
      <span className="shrink-0 text-[11px] text-[var(--wf-text-faint)]">{role}</span>
    </div>
  );
}

interface LlmModelFieldProps {
  model: string | undefined;
  suggestions: string[];
  onChange: (model: string) => void;
}

// Mounted with key={nodeId} so the custom-editing state resets per node.
function LlmModelField({ model, suggestions, onChange }: LlmModelFieldProps): React.ReactElement {
  const { t } = useTranslation();
  const [customEditing, setCustomEditing] = useState(false);

  const value = model?.trim() ?? '';
  const isKnown = value === '' || suggestions.includes(value);
  const showCustomInput = customEditing || !isKnown;

  return (
    <div className="mt-3.5 flex flex-col gap-1.5">
      <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.modelField')}</span>
      <div className="relative">
        <select
          value={showCustomInput ? MODEL_CUSTOM_OPTION : value}
          onChange={(event) => {
            const next = event.target.value;
            if (next === MODEL_CUSTOM_OPTION) {
              setCustomEditing(true);
              return;
            }
            setCustomEditing(false);
            onChange(next);
          }}
          className={`${INPUT_CLASS} appearance-none pr-8`}
        >
          <option value="">{t('workflowMode.properties.modelFollowGlobal')}</option>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion}>
              {suggestion}
            </option>
          ))}
          <option value={MODEL_CUSTOM_OPTION}>
            {t('workflowMode.properties.modelCustomOption')}
          </option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--wf-text-muted)]" />
      </div>
      {showCustomInput ? (
        <input
          type="text"
          value={model ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={INPUT_CLASS}
          placeholder={t('workflowMode.properties.modelFollowGlobal')}
        />
      ) : null}
    </div>
  );
}

export function WorkflowPropertiesPanel(): React.ReactElement {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const workflowNodes = useWorkflowStore((state) => state.workflowNodes);
  const workflowEdges = useWorkflowStore((state) => state.workflowEdges);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const selectedEdgeId = useWorkflowStore((state) => state.selectedEdgeId);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const setSelectedEdgeId = useWorkflowStore((state) => state.setSelectedEdgeId);
  const updateWorkflowNodeData = useWorkflowStore((state) => state.updateWorkflowNodeData);
  const deleteWorkflowNode = useWorkflowStore((state) => state.deleteWorkflowNode);
  const deleteWorkflowEdge = useWorkflowStore((state) => state.deleteWorkflowEdge);
  const aiSettings = useFlowStore((state) => state.aiSettings);
  const documents = useKnowledgeStore((state) => state.documents);
  const addDocument = useKnowledgeStore((state) => state.addDocument);
  const runStatus = useWorkflowRunStore((state) => state.runStatus);
  const nodeRunStates = useWorkflowRunStore((state) => state.nodeRunStates);
  const lastRunOutputs = useWorkflowRunStore((state) => state.lastRunOutputs);
  const runSingleNode = useWorkflowRunStore((state) => state.runSingleNode);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const modelSuggestions = useMemo(() => {
    const provider = aiSettings.provider || 'gemini';
    const candidates = [aiSettings.model, DEFAULT_MODELS[provider]];
    return [
      ...new Set(
        candidates.filter((model): model is string => Boolean(model && model.trim()))
      ),
    ];
  }, [aiSettings]);

  const selectedNode = workflowNodes.find((node) => node.id === selectedNodeId);
  const data = selectedNode?.data as unknown as WorkflowNodeData | undefined;
  const meta = data ? WORKFLOW_NODE_CATALOG.find((entry) => entry.kind === data.kind) : undefined;

  const selectedEdge = workflowEdges.find((edge) => edge.id === selectedEdgeId);
  const edgeSourceData = selectedEdge
    ? (workflowNodes.find((node) => node.id === selectedEdge.source)?.data as unknown as
        | WorkflowNodeData
        | undefined)
    : undefined;
  const edgeTargetData = selectedEdge
    ? (workflowNodes.find((node) => node.id === selectedEdge.target)?.data as unknown as
        | WorkflowNodeData
        | undefined)
    : undefined;

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

  const branchTargets = useMemo(() => {
    if (!selectedNode || data?.kind !== 'ifElse') {
      return { trueLabel: '—', falseLabel: '—' };
    }
    const labelOf = (handle: 'true' | 'false'): string => {
      const edge = workflowEdges.find(
        (entry) => entry.source === selectedNode.id && entry.sourceHandle === handle
      );
      if (!edge) {
        return t('workflowMode.properties.branchUnconnected');
      }
      const target = workflowNodes.find((node) => node.id === edge.target);
      const targetData = target?.data as unknown as WorkflowNodeData | undefined;
      return targetData?.label ?? edge.target;
    };
    return { trueLabel: labelOf('true'), falseLabel: labelOf('false') };
  }, [selectedNode, data?.kind, workflowEdges, workflowNodes, t]);

  const closePanel = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  return (
    <aside className="flex min-h-0 flex-col border-l border-[var(--wf-border)] bg-[var(--wf-surface)]">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4 pt-3.5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] tracking-[0.05em] text-[var(--wf-text-faint)]">
            {t('workflowMode.properties.title')}
          </h2>
          {selectedNode || selectedEdge ? (
            <button
              type="button"
              onClick={closePanel}
              title={t('workflowMode.properties.closePanel')}
              aria-label={t('workflowMode.properties.closePanel')}
              className="-mr-1.5 -mt-1 flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-[var(--wf-text-muted)] transition-colors hover:bg-[#F3F5F8] hover:text-[var(--wf-text-label)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {selectedNode && data ? (
          <>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]"
                style={meta ? workflowToneStyle(meta.tone) : undefined}
              >
                <WorkflowNodeIcon kind={data.kind} className="h-[17px] w-[17px]" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold leading-tight text-[var(--wf-text)]">
                  {data.label}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={meta ? { background: `var(--wf-t-${meta.tone}-fg)` } : undefined}
                  />
                  <span className="text-xs text-[var(--wf-text-type)]">
                    {t(`workflowMode.nodes.${data.kind}.name`)}
                  </span>
                </div>
              </div>
            </div>

            {data.kind !== 'output' ? (
              <button
                type="button"
                onClick={() => void runSingleNode(selectedNode.id)}
                disabled={isBusy}
                className="mt-3.5 flex h-[34px] w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--wf-acc-border)] bg-[var(--wf-acc-soft)] text-[13px] font-semibold text-[var(--wf-acc)] transition-colors hover:bg-[var(--wf-acc-soft-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-2.5 w-2.5 fill-current" />
                {t('workflowMode.properties.runNode')}
              </button>
            ) : null}

            <SectionDivider />
            <div className={SECTION_HEADER_CLASS}>
              {t('workflowMode.properties.sections.basic')}
            </div>
            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.labelField')}</span>
              <input
                type="text"
                value={data.label}
                onChange={(event) => patchNode({ label: event.target.value })}
                className={INPUT_CLASS}
              />
            </label>
            <div className="mt-3.5 flex items-center justify-between gap-2">
              <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.nodeIdField')}</span>
              <span className={META_PILL_CLASS}>{selectedNode.id}</span>
            </div>
            {data.kind !== 'ifElse' && data.kind !== 'output' ? (
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className={FIELD_LABEL_CLASS}>{t('workflowMode.properties.refField')}</span>
                <span className={REF_PILL_CLASS}>{`{{${selectedNode.id}.text}}`}</span>
              </div>
            ) : null}

            {data.kind === 'llm' ? (
              <LlmModelField
                key={selectedNode.id}
                model={data.model}
                suggestions={modelSuggestions}
                onChange={(model) => patchNode({ model })}
              />
            ) : null}

            <SectionDivider />
            {data.kind === 'llm' ? (
              <>
                <div className={SECTION_HEADER_CLASS}>
                  {t('workflowMode.properties.sections.prompt')}
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className={FIELD_LABEL_CLASS}>
                    {t('workflowMode.properties.systemPromptField')}
                  </span>
                  <textarea
                    value={data.systemPrompt ?? ''}
                    onChange={(event) => patchNode({ systemPrompt: event.target.value })}
                    className={TEXTAREA_CLASS}
                    placeholder={t('workflowMode.properties.systemPromptPlaceholder')}
                  />
                </label>
                <label className="mt-3.5 flex flex-col gap-1.5">
                  <span className="flex items-center justify-between">
                    <span className={FIELD_LABEL_CLASS}>
                      {t('workflowMode.properties.promptField')}
                    </span>
                    <WorkflowVariablePicker
                      nodeId={selectedNode.id}
                      onPick={(template) => patchNode({ prompt: (data.prompt ?? '') + template })}
                    />
                  </span>
                  <textarea
                    value={data.prompt ?? ''}
                    onChange={(event) => patchNode({ prompt: event.target.value })}
                    className={`${TEXTAREA_CLASS} min-h-[180px] text-[12.5px] leading-relaxed`}
                    placeholder={t('workflowMode.properties.promptPlaceholder')}
                  />
                </label>
              </>
            ) : (
              <>
                <div className={SECTION_HEADER_CLASS}>
                  {data.kind === 'textInput' || data.kind === 'output'
                    ? t('workflowMode.properties.sections.content')
                    : data.kind === 'ifElse'
                      ? t('workflowMode.properties.sections.condition')
                      : data.kind === 'code'
                        ? t('workflowMode.properties.sections.code')
                        : t('workflowMode.properties.sections.retrieval')}
                </div>

                {data.kind === 'textInput' ? (
                  <label className="flex flex-col gap-1.5">
                    <span className={FIELD_LABEL_CLASS}>
                      {t('workflowMode.properties.textField')}
                    </span>
                    <textarea
                      value={data.text ?? ''}
                      onChange={(event) => patchNode({ text: event.target.value })}
                      className={`${TEXTAREA_CLASS} min-h-[96px]`}
                      placeholder={t('workflowMode.properties.textPlaceholder')}
                    />
                    <span className="text-xs leading-relaxed text-[var(--wf-text-faint)]">
                      {t('workflowMode.properties.textHint')}
                    </span>
                  </label>
                ) : null}

                {data.kind === 'webSearch' ? (
                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center justify-between">
                      <span className={FIELD_LABEL_CLASS}>
                        {t('workflowMode.properties.queryField')}
                      </span>
                      <WorkflowVariablePicker
                        nodeId={selectedNode.id}
                        onPick={(template) => patchNode({ query: (data.query ?? '') + template })}
                      />
                    </span>
                    <input
                      type="text"
                      value={data.query ?? ''}
                      onChange={(event) => patchNode({ query: event.target.value })}
                      className={`${INPUT_CLASS} font-mono text-[12.5px]`}
                      placeholder={t('workflowMode.properties.queryPlaceholder')}
                    />
                  </label>
                ) : null}

                {data.kind === 'knowledgeRetrieval' ? (
                  <div className="flex flex-col gap-3.5">
                    <label className="flex flex-col gap-1.5">
                      <span className={FIELD_LABEL_CLASS}>
                        {t('workflowMode.properties.knowledgeDocField')}
                      </span>
                      <div className="relative">
                        <select
                          value={data.knowledgeDocId ?? BUILTIN_DOC_ID}
                          onChange={(event) => patchNode({ knowledgeDocId: event.target.value })}
                          className={`${INPUT_CLASS} appearance-none pr-8`}
                        >
                          {documents.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--wf-text-muted)]" />
                      </div>
                    </label>
                    <div className="flex items-start gap-1.5 rounded-lg bg-[var(--wf-t-cond-bg)] px-2.5 py-2 text-xs leading-relaxed text-[var(--wf-t-cond-fg)]">
                      <span className="mt-0.5 shrink-0">⚠</span>
                      <span>{t('workflowMode.properties.knowledgeEmptyHint')}</span>
                    </div>
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
                      className={DASHED_BUTTON_CLASS}
                    >
                      {t('workflowMode.properties.knowledgeUpload')}
                    </button>
                    <label className="flex flex-col gap-1.5">
                      <span className="flex items-center justify-between">
                        <span className={FIELD_LABEL_CLASS}>
                          {t('workflowMode.properties.knowledgeQueryField')}
                        </span>
                        <WorkflowVariablePicker
                          nodeId={selectedNode.id}
                          onPick={(template) => patchNode({ query: (data.query ?? '') + template })}
                        />
                      </span>
                      <input
                        type="text"
                        value={data.query ?? ''}
                        onChange={(event) => patchNode({ query: event.target.value })}
                        className={`${INPUT_CLASS} font-mono text-[12.5px]`}
                        placeholder={t('workflowMode.properties.queryPlaceholder')}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
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
                            knowledgeTopK: Number.isNaN(parsed)
                              ? 3
                              : Math.min(10, Math.max(1, parsed)),
                          });
                        }}
                        className={INPUT_CLASS}
                      />
                    </label>
                  </div>
                ) : null}

                {data.kind === 'ifElse' ? (
                  <div className="flex flex-col gap-2">
                    {(data.conditions ?? []).length === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          patchConditions([
                            {
                              id: createId('wf-cond'),
                              variable: '',
                              operator: 'isNotEmpty',
                              value: '',
                            },
                          ])
                        }
                        className={DASHED_BUTTON_CLASS}
                      >
                        + {t('workflowMode.properties.addCondition')}
                      </button>
                    ) : null}
                    {(data.conditions ?? []).map((condition) => {
                      const conditions = data.conditions ?? [];
                      const patchCondition = (patch: Partial<WorkflowCondition>) =>
                        patchConditions(
                          conditions.map((entry) =>
                            entry.id === condition.id ? { ...entry, ...patch } : entry
                          )
                        );
                      const needsValue = !OPERATORS_WITHOUT_VALUE.has(condition.operator);
                      return (
                        <div
                          key={condition.id}
                          className="flex flex-col gap-1.5 rounded-lg border border-[var(--wf-input-border)] bg-white p-2"
                        >
                          <span className={FIELD_LABEL_CLASS}>
                            {t('workflowMode.properties.conditionVariable')}
                          </span>
                          <select
                            value={condition.variable}
                            onChange={(event) => patchCondition({ variable: event.target.value })}
                            aria-label={t('workflowMode.properties.conditionVariable')}
                            className={`${COMPACT_SELECT_CLASS} font-mono`}
                          >
                            <option value="">
                              {t('workflowMode.properties.conditionUpstream')}
                            </option>
                            {listUpstreamVariables(
                              selectedNode.id,
                              workflowNodes,
                              workflowEdges
                            ).map((option) => (
                              <option key={option.selector} value={option.selector}>
                                {`{{${option.selector}}}`} · {option.nodeLabel}
                              </option>
                            ))}
                          </select>
                          <span className={`${FIELD_LABEL_CLASS} mt-1`}>
                            {t('workflowMode.properties.conditionOperator')}
                          </span>
                          <select
                            value={condition.operator}
                            onChange={(event) =>
                              patchCondition({
                                operator: event.target.value as WorkflowConditionOperator,
                              })
                            }
                            aria-label={t('workflowMode.properties.conditionOperator')}
                            className={COMPACT_SELECT_CLASS}
                          >
                            {CONDITION_OPERATORS.map((operator) => (
                              <option key={operator} value={operator}>
                                {t(`workflowMode.properties.conditionOp.${operator}`)}
                              </option>
                            ))}
                          </select>
                          {needsValue ? (
                            <>
                              <span className={`${FIELD_LABEL_CLASS} mt-1`}>
                                {t('workflowMode.properties.conditionValue')}
                              </span>
                              <input
                                type="text"
                                value={condition.value}
                                onChange={(event) =>
                                  patchCondition({ value: event.target.value })
                                }
                                aria-label={t('workflowMode.properties.conditionValue')}
                                placeholder={t('workflowMode.properties.conditionValue')}
                                className={`${COMPACT_SELECT_CLASS} font-mono`}
                              />
                            </>
                          ) : null}
                          {conditions.length > 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                patchConditions(
                                  conditions.filter((entry) => entry.id !== condition.id)
                                )
                              }
                              aria-label={t('workflowMode.properties.removeCondition')}
                              className="self-end text-xs text-[var(--wf-text-muted)] hover:text-[var(--wf-danger)]"
                            >
                              {t('workflowMode.properties.removeCondition')}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                    {(data.conditions ?? []).length > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          patchConditions([
                            ...(data.conditions ?? []),
                            {
                              id: createId('wf-cond'),
                              variable: '',
                              operator: 'contains',
                              value: '',
                            },
                          ])
                        }
                        className={DASHED_BUTTON_CLASS}
                      >
                        + {t('workflowMode.properties.addCondition')}
                      </button>
                    ) : null}

                    <SectionDivider />
                    <div className={SECTION_HEADER_CLASS}>
                      {t('workflowMode.properties.sections.branches')}
                    </div>
                    <div className="rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] p-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="shrink-0 rounded-full bg-[var(--wf-t-out-bg)] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-[var(--wf-t-out-fg)]">
                          true
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                          {branchTargets.trueLabel}
                        </span>
                        <span className="shrink-0 text-[11px] text-[var(--wf-text-faint)]">
                          {t('workflowMode.properties.branchTrueHint')}
                        </span>
                      </div>
                      <div className="ml-[17px] my-1.5 h-3 w-[1.5px] bg-[#E6E8EC]" />
                      <div className="flex items-center gap-2.5">
                        <span className="shrink-0 rounded-full bg-[var(--wf-t-end-bg,#FBEAE8)] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-[var(--wf-t-end-fg,#C4443C)]">
                          false
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                          {branchTargets.falseLabel}
                        </span>
                        <span className="shrink-0 text-[11px] text-[var(--wf-text-faint)]">
                          {t('workflowMode.properties.branchFalseHint')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--wf-text-muted)]">
                      {t('workflowMode.properties.ifElseHint')}
                    </p>
                  </div>
                ) : null}

                {data.kind === 'code' ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className={FIELD_LABEL_CLASS}>
                        {t('workflowMode.properties.codeLanguage')}
                      </span>
                      <span className="text-[12.5px] font-medium text-[var(--wf-text-label)]">
                        JavaScript
                      </span>
                    </div>
                    <textarea
                      value={data.code ?? ''}
                      onChange={(event) => patchNode({ code: event.target.value })}
                      rows={12}
                      spellCheck={false}
                      className={`${TEXTAREA_CLASS} min-h-[220px] bg-[#FCFCFD] font-mono text-[11.5px] leading-relaxed`}
                    />
                    <span className="text-xs leading-relaxed text-[var(--wf-text-muted)]">
                      {t('workflowMode.properties.codeHint')}
                    </span>
                    <div className="mt-3.5 flex items-center justify-between">
                      <span className={FIELD_LABEL_CLASS}>
                        {t('workflowMode.properties.codeTimeout')}
                      </span>
                      <span className="text-[12.5px] font-medium text-[var(--wf-text-label)]">
                        {t('workflowMode.properties.codeTimeoutValue', {
                          seconds: CODE_TIMEOUT_MS / 1000,
                        })}
                      </span>
                    </div>
                  </div>
                ) : null}

                {data.kind === 'output' ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center justify-between">
                      <span className={FIELD_LABEL_CLASS}>
                        {t('workflowMode.properties.outputContentField')}
                      </span>
                      <WorkflowVariablePicker
                        nodeId={selectedNode.id}
                        onPick={(template) => patchNode({ text: (data.text ?? '') + template })}
                      />
                    </span>
                    <textarea
                      value={data.text ?? ''}
                      onChange={(event) => patchNode({ text: event.target.value })}
                      className={`${TEXTAREA_CLASS} min-h-[84px] font-mono text-[12.5px] leading-relaxed`}
                      placeholder={t('workflowMode.properties.outputContentPlaceholder')}
                    />
                    <span className="text-xs leading-relaxed text-[var(--wf-text-faint)]">
                      {t('workflowMode.properties.outputHint')}
                    </span>
                  </div>
                ) : null}
              </>
            )}

            <SectionDivider />
            <div className={SECTION_HEADER_CLASS}>{t('workflowMode.properties.lastRun')}</div>
            {lastRunOutput === undefined && Object.keys(lastRunInputs).length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--wf-input-border)] px-3 py-3.5 text-center text-xs leading-relaxed text-[var(--wf-text-muted)]">
                {data.kind === 'ifElse'
                  ? t('workflowMode.properties.lastRunEmptyBranch')
                  : data.kind === 'output'
                    ? t('workflowMode.properties.lastRunEmptyOutput')
                    : t('workflowMode.properties.lastRunEmpty')}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.keys(lastRunInputs).length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--wf-text-label)]">
                      {t('workflowMode.properties.lastRunInput')}
                    </span>
                    <pre className="max-h-32 overflow-auto rounded-lg border border-[var(--wf-input-border)] bg-white p-2 text-[11px] leading-relaxed text-[var(--wf-text)]">
                      {JSON.stringify(lastRunInputs, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {lastRunOutput !== undefined ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--wf-text-label)]">
                      {t('workflowMode.properties.lastRunOutput')}
                    </span>
                    <pre className="max-h-32 overflow-auto rounded-lg border border-[var(--wf-input-border)] bg-white p-2 text-[11px] leading-relaxed text-[var(--wf-text)]">
                      {JSON.stringify(lastRunOutput, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            )}
          </>
        ) : selectedEdge ? (
          <>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[color-mix(in_srgb,var(--wf-acc)_10%,#fff)] text-[var(--wf-acc)]">
                <Link className="h-[17px] w-[17px]" />
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold leading-tight text-[var(--wf-text)]">
                  {t('workflowMode.properties.edgePanel.title')}
                </div>
                <div className="mt-1 truncate text-xs text-[var(--wf-text-type)]">
                  {edgeSourceData?.label} → {edgeTargetData?.label}
                </div>
              </div>
            </div>

            <div className="mt-3.5 rounded-[10px] border border-[var(--wf-panel-card-border)] bg-[var(--wf-panel-card-bg)] p-2.5">
              <EdgeEndpointRow
                data={edgeSourceData}
                role={t('workflowMode.properties.edgePanel.source')}
              />
              <div className="ml-[13px] h-3.5 w-[1.5px] bg-[var(--wf-input-border)]" />
              <EdgeEndpointRow
                data={edgeTargetData}
                role={t('workflowMode.properties.edgePanel.target')}
              />
            </div>

            <button
              type="button"
              onClick={() => deleteWorkflowEdge(selectedEdge.id)}
              className="mt-3.5 flex h-[34px] w-full items-center justify-center gap-[7px] rounded-lg border border-[var(--wf-danger-tint-border)] bg-[var(--wf-danger-tint-bg)] text-[13px] font-semibold text-[var(--wf-danger)] transition-colors hover:bg-[var(--wf-danger-tint-hover)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('workflowMode.properties.edgePanel.delete')}
            </button>
            <p className="mt-2.5 text-center text-xs leading-relaxed text-[var(--wf-text-faint)]">
              {t('workflowMode.properties.edgePanel.deleteHint')}
            </p>
          </>
        ) : (
          <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-[var(--wf-input-border)] p-6 text-center">
            <p className="text-xs leading-relaxed text-[var(--wf-text-muted)]">
              {t('workflowMode.properties.empty')}
            </p>
          </div>
        )}
      </div>

      {selectedNode ? (
        <div className="border-t border-[var(--wf-hairline)] px-3 py-2">
          <button
            type="button"
            onClick={() => deleteWorkflowNode(selectedNode.id)}
            aria-label={t('workflowMode.properties.deleteAria')}
            className="inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1.5 text-[12.5px] font-medium text-[var(--wf-danger)] transition-colors hover:bg-[var(--wf-danger-soft)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('workflowMode.properties.delete')}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
