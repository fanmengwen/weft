import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createLogger } from '@/lib/logger';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { captureAnalyticsEvent } from '@/services/analytics/analytics';
import { chatWithFlowpilot } from '@/services/aiService';
import {
  buildFlowpilotConversationPrompt,
  buildFlowpilotAssistantSystemInstruction,
  buildFlowpilotDiagramPrompt,
} from '@/services/flowpilot/prompting';
import { groundFlowpilotAssets, summarizeAssetGrounding } from '@/services/flowpilot/assetGrounding';
import { buildFlowpilotPlan } from '@/services/flowpilot/responsePolicy';
import {
  assistantThreadToChatMessages,
  createAnswerThreadItem,
  createAppliedThreadItem,
  createErrorThreadItem,
  createPlanThreadItem,
  createPreviewThreadItem,
  createUserThreadItem,
} from '@/services/flowpilot/thread';
import i18n from '@/i18n/config';
import { threadKey } from '@/services/flowpilot/flowpilotThreadCopy';
import type {
  AssistantThreadItem,
  AssetGroundingMatch,
  FlowpilotCopyKey,
  FlowpilotPreviewDetailKey,
} from '@/services/flowpilot/types';
import { useFlowStore } from '@/store';
import { useToast } from '@/components/ui/ToastContext';
import { toErrorMessage } from './ai-generation/graphComposer';
import { generateAIFlowResult, type GenerateAIFlowResult } from './ai-generation/requestLifecycle';
import { parseStreamingDsl } from './ai-generation/streamingParser';
import { setStreamingGraph, setStreamingActive } from './ai-generation/streamingStore';
import {
  buildCodeToArchitecturePrompt,
  buildCodebaseToArchitecturePrompt,
  type SupportedLanguage,
} from './ai-generation/codeToArchitecture';
import type { CodebaseAnalysis } from './ai-generation/codebaseAnalyzer';
import { buildCodebaseNativeDiagram } from './ai-generation/codebaseToNativeDiagram';
import { buildSqlToErdPrompt } from './ai-generation/sqlToErd';
import {
  buildTerraformToCloudPrompt,
  type TerraformInputFormat,
} from './ai-generation/terraformToCloud';
import { buildOpenApiToSequencePrompt } from './ai-generation/openApiToSequence';
import { getAIReadinessState } from './ai-generation/readiness';
import {
  clearChatHistory,
  clearAssistantThreadHistory,
  loadAssistantThreadHistory,
  saveAssistantThreadHistory,
} from './ai-generation/chatHistoryStorage';
import { notifyOperationOutcome } from '@/services/operationFeedback';

const logger = createLogger({ scope: 'useAIGeneration' });

export interface ImportDiff {
  addedCount: number;
  removedCount: number;
  updatedCount: number;
  dslText: string;
  copyKey: FlowpilotCopyKey;
  previewTitle?: string;
  previewDetailKey?: FlowpilotPreviewDetailKey;
  previewDetail?: string;
  previewStats?: string[];
  assetMatches?: AssetGroundingMatch[];
  result: GenerateAIFlowResult;
}

function tThread(copyKey: FlowpilotCopyKey): string {
  return i18n.t(threadKey(copyKey));
}

function tPreviewDetail(detailKey: FlowpilotPreviewDetailKey): string {
  return i18n.t(threadKey('previewDetail', detailKey));
}

type PreviewRequestKind =
  | 'prompt'
  | 'focused-edit'
  | 'code-import'
  | 'sql-import'
  | 'terraform-import'
  | 'openapi-import';

interface PreviewDescriptor {
  title: string;
  detail?: string;
  stats?: string[];
}

function buildPreviewCopy(
  requestKind: PreviewRequestKind,
  addedCount: number,
  updatedCount: number,
  previewDescriptor?: PreviewDescriptor
): Pick<ImportDiff, 'copyKey' | 'previewTitle' | 'previewDetailKey' | 'previewDetail' | 'previewStats'> {
  if (previewDescriptor) {
    return {
      copyKey: 'importReady',
      previewTitle: previewDescriptor.title,
      previewDetail: previewDescriptor.detail,
      previewStats: previewDescriptor.stats,
    };
  }

  if (requestKind === 'code-import') {
    const hasChanges = addedCount > 0 || updatedCount > 0;
    return {
      copyKey: 'codeEnhancementReady',
      previewDetailKey: hasChanges ? 'codeEnhancementWithChanges' : 'codeEnhancementNoChanges',
      previewStats: undefined,
    };
  }

  return {
    copyKey: 'importReady',
    previewStats: undefined,
  };
}

function computeImportDiff(
  currentNodes: FlowNode[],
  result: GenerateAIFlowResult,
  requestKind: PreviewRequestKind,
  previewDescriptor?: PreviewDescriptor,
  assetMatches?: AssetGroundingMatch[]
): ImportDiff {
  const currentIds = new Set(currentNodes.map((n) => n.id));
  const newIds = new Set(result.layoutedNodes.map((n) => n.id));
  const addedCount = result.layoutedNodes.filter((n) => !currentIds.has(n.id)).length;
  const removedCount = currentNodes.filter((n) => !newIds.has(n.id)).length;
  const updatedCount = result.layoutedNodes.filter((n) => currentIds.has(n.id)).length;

  return {
    addedCount,
    removedCount,
    updatedCount,
    dslText: result.dslText,
    assetMatches,
    ...buildPreviewCopy(requestKind, addedCount, updatedCount, previewDescriptor),
    result,
  };
}

function buildCodebasePreviewDescriptor(
  analysis: CodebaseAnalysis,
  nativeDiagram: ReturnType<typeof buildCodebaseNativeDiagram>
): PreviewDescriptor {
  const platformLabel =
    analysis.cloudPlatform === 'unknown'
      ? 'Platform: app-only'
      : `Platform: ${analysis.cloudPlatform}`;
  const serviceLabel =
    nativeDiagram.platformServiceCount > 0
      ? `${nativeDiagram.platformServiceCount} platform service${nativeDiagram.platformServiceCount === 1 ? '' : 's'}`
      : `${analysis.detectedServices.length} detected service${analysis.detectedServices.length === 1 ? '' : 's'}`;

  return {
    title: 'Codebase enhancement ready — review the upgraded diagram.',
    detail:
      'Started from the native repository map, then layered in AI architecture upgrades for services, sections, and labeled flows.',
    stats: [
      platformLabel,
      `${nativeDiagram.sectionCount} native section${nativeDiagram.sectionCount === 1 ? '' : 's'}`,
      serviceLabel,
      `${nativeDiagram.edgeCount} preview edge${nativeDiagram.edgeCount === 1 ? '' : 's'}`,
    ],
  };
}

function getSuccessSummary(existingNodeCount: number, focusedNodeIds?: string[]): string {
  if ((focusedNodeIds?.length ?? 0) > 0) {
    return 'Applied AI changes to the selected nodes.';
  }

  if (existingNodeCount > 0) {
    return 'Applied AI changes to the current diagram.';
  }

  return 'Created a new AI diagram draft.';
}

function getFailureSummary(existingNodeCount: number, focusedNodeIds?: string[]): string {
  if ((focusedNodeIds?.length ?? 0) > 0) {
    return 'Could not update the selected nodes.';
  }

  if (existingNodeCount > 0) {
    return 'Could not update the current diagram.';
  }

  return 'Could not generate the requested diagram.';
}

export function useAIGeneration(
  recordHistory: () => void,
  applyComposedGraph: (nodes: FlowNode[], edges: FlowEdge[]) => void
) {
  const { nodes, edges, aiSettings, globalEdgeOptions, activeTabId, setNodes, setEdges } =
    useFlowStore();
  const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pendingDiff, setPendingDiff] = useState<ImportDiff | null>(null);
  const [assistantThread, setAssistantThread] = useState<AssistantThreadItem[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Accumulates streamed DSL text outside the React state updater so the live
  // graph store can be updated at the top level of onChunk (see runDiagramRequest).
  const streamingTextRef = useRef('');
  // Node/edge ids the in-flight generation has written to the live canvas, so a
  // retry or hard failure can roll back exactly this attempt's partial output.
  const streamedIdsRef = useRef<{ nodes: Set<string>; edges: Set<string> }>({
    nodes: new Set(),
    edges: new Set(),
  });
  // Rough placement offset for incrementally streamed nodes, computed once per
  // request from the pre-existing canvas so new nodes don't land on top of it.
  const streamBaselineRef = useRef({ offsetX: 0, offsetY: 0 });
  const [lastError, setLastError] = useState<string | null>(null);
  const readiness = getAIReadinessState(aiSettings);

  const chatMessages = useMemo(() => assistantThreadToChatMessages(assistantThread), [assistantThread]);

  const persistThread = useCallback(
    (nextItems: AssistantThreadItem[]) => {
      void saveAssistantThreadHistory(activeTabId, nextItems);
    },
    [activeTabId]
  );

  const appendThreadItem = useCallback(
    (item: AssistantThreadItem) => {
      setAssistantThread((previous) => {
        const next = [...previous, item];
        persistThread(next);
        return next;
      });
    },
    [persistThread]
  );

  useEffect(() => {
    let isDisposed = false;

    void loadAssistantThreadHistory(activeTabId).then((messages) => {
      if (!isDisposed) {
        setAssistantThread(messages);
      }
    });

    return () => {
      isDisposed = true;
    };
  }, [activeTabId]);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearChat = useCallback(() => {
    void clearAssistantThreadHistory(activeTabId);
    void clearChatHistory(activeTabId);
    setAssistantThread([]);
  }, [activeTabId]);

  const clearLastError = useCallback(() => {
    setLastError(null);
  }, []);

  const confirmPendingDiff = useCallback(() => {
    if (!pendingDiff) return;
    recordHistory();
    applyComposedGraph(pendingDiff.result.layoutedNodes, pendingDiff.result.layoutedEdges);
    appendThreadItem(createAppliedThreadItem('appliedToCanvas'));
    notifyOperationOutcome(addToast, { status: 'success', summary: tThread('importApplied') });
    setPendingDiff(null);
  }, [pendingDiff, applyComposedGraph, addToast, recordHistory, appendThreadItem]);

  const discardPendingDiff = useCallback(() => {
    setPendingDiff(null);
  }, []);

  const runConversationRequest = useCallback(
    async (
      prompt: string,
      mode: 'answer' | 'plan',
      assetMatches: AssetGroundingMatch[],
      imageBase64?: string
    ): Promise<boolean> => {
      if (!readiness.canGenerate && readiness.blockingIssue) {
        setLastError(readiness.blockingIssue.detail);
        return false;
      }

      setLastError(null);
      setStreamingText('');
      setRetryCount(0);
      setIsGenerating(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await chatWithFlowpilot(
          chatMessages,
          buildFlowpilotConversationPrompt(
            prompt,
            {
              prompt,
              nodeCount: nodes.length,
              selectedNodeCount: selectedNodeIds.length,
              hasImage: Boolean(imageBase64),
            },
            assetMatches,
            mode
          ),
          buildFlowpilotAssistantSystemInstruction(mode),
          aiSettings.apiKey,
          aiSettings.model,
          aiSettings.provider || 'gemini',
          aiSettings.customBaseUrl,
          (delta) => setStreamingText((previous) => (previous ?? '') + delta),
          controller.signal
        );

        appendThreadItem(createAnswerThreadItem(response, mode, assetMatches));
        notifyOperationOutcome(addToast, {
          status: 'success',
          summary: mode === 'plan' ? tThread('planReady') : tThread('answeredInChat'),
        });
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return false;
        }
        const errorMessage = toErrorMessage(error);
        setLastError(errorMessage);
        appendThreadItem(createErrorThreadItem(errorMessage));
        notifyOperationOutcome(addToast, {
          status: 'error',
          summary: tThread('generationFailed'),
          detail: errorMessage,
        });
        return false;
      } finally {
        abortControllerRef.current = null;
        setIsGenerating(false);
        setStreamingText(null);
        setRetryCount(0);
      }
    },
    [
      addToast,
      aiSettings.apiKey,
      aiSettings.customBaseUrl,
      aiSettings.model,
      aiSettings.provider,
      appendThreadItem,
      chatMessages,
      nodes.length,
      readiness.blockingIssue,
      readiness.canGenerate,
      selectedNodeIds.length,
    ]
  );

  const runDiagramRequest = useCallback(
    async (
      prompt: string,
      imageBase64?: string,
      focusedNodeIds?: string[],
      showPreview = false,
      requestKind: PreviewRequestKind = 'prompt',
      seedDsl?: string,
      previewDescriptor?: PreviewDescriptor,
      assetMatches?: AssetGroundingMatch[]
    ): Promise<boolean> => {
      if (!readiness.canGenerate && readiness.blockingIssue) {
        setLastError(readiness.blockingIssue.detail);
        notifyOperationOutcome(addToast, {
          status: readiness.blockingIssue.tone,
          summary: readiness.blockingIssue.title,
          detail: readiness.blockingIssue.detail,
        });
        return false;
      }

      setLastError(null);
      streamingTextRef.current = '';
      setStreamingText('');
      setStreamingGraph(null);
      setStreamingActive(true);
      setRetryCount(0);
      streamedIdsRef.current = { nodes: new Set(), edges: new Set() };
      // Editing an existing diagram re-streams the whole DSL, including nodes
      // the model kept unchanged — those ids already exist on the live canvas
      // before this request even starts, so they must be excluded from the
      // "new node" check below or they'd be added a second time.
      const preExistingNodeIds = new Set(nodes.map((n) => n.id));
      const preExistingEdgeIds = new Set(edges.map((e) => e.id));
      streamBaselineRef.current =
        nodes.length > 0
          ? {
              offsetX: Math.min(...nodes.map((n) => n.position.x)),
              offsetY: Math.max(...nodes.map((n) => n.position.y + (n.height ?? 80))) + 120,
            }
          : { offsetX: 0, offsetY: 0 };
      if (!showPreview) recordHistory();
      setIsGenerating(true);

      const rollbackStreamedGraph = () => {
        const { nodes: staleNodeIds, edges: staleEdgeIds } = streamedIdsRef.current;
        if (staleNodeIds.size === 0 && staleEdgeIds.size === 0) return;
        setNodes((prev) => prev.filter((n) => !staleNodeIds.has(n.id)));
        setEdges((prev) => prev.filter((e) => !staleEdgeIds.has(e.id)));
        streamedIdsRef.current = { nodes: new Set(), edges: new Set() };
      };

      const controller = new AbortController();
      abortControllerRef.current = controller;
      captureAnalyticsEvent('ai_generation_started', {
        provider: aiSettings.provider || 'gemini',
        has_image: Boolean(imageBase64),
        is_preview: showPreview,
        request_kind: requestKind,
        selected_count: focusedNodeIds?.length ?? selectedNodeIds.length,
      });

      try {
        const result = await generateAIFlowResult({
          chatMessages,
          prompt: buildFlowpilotDiagramPrompt(prompt, assetMatches ?? []),
          seedDsl,
          imageBase64,
          nodes,
          edges,
          selectedNodeIds: focusedNodeIds ?? selectedNodeIds,
          aiSettings,
          globalEdgeOptions,
          onChunk: (delta) => {
            // Accumulate via a ref and update stores at the TOP LEVEL of this
            // async callback. Previously setStreamingGraph() was called inside
            // the setStreamingText updater, which React runs during its render
            // phase — that triggered "Cannot update a component
            // (StreamingOverlay) while rendering a different component".
            const next = streamingTextRef.current + delta;
            streamingTextRef.current = next;
            setStreamingText(next);
            const parsed = parseStreamingDsl(next);
            if (parsed.nodeCount === 0) return;

            if (showPreview) {
              // Preview flows (e.g. codebase import) still gate on an explicit
              // Apply, so only the floating overlay shows live progress.
              setStreamingGraph(parsed);
              return;
            }

            // Everything else lands directly on the real canvas as it streams
            // in — no preview/Apply step. New nodes get a rough offset position
            // (refined by the ELK settle pass once generation finishes) and the
            // existing fade-in animation. A node's own line can still be mid-way
            // through streaming its label/attributes when it first becomes
            // parseable (e.g. an unclosed "{ color: ..." trailing fragment), so
            // already-seen ids get their label refreshed rather than left alone.
            const { offsetX, offsetY } = streamBaselineRef.current;
            const newNodes: typeof parsed.nodes = [];
            const labelUpdates = new Map<string, string>();
            for (const n of parsed.nodes) {
              if (preExistingNodeIds.has(n.id) || streamedIdsRef.current.nodes.has(n.id)) {
                labelUpdates.set(n.id, n.data.label);
              } else {
                newNodes.push(n);
              }
            }
            const newEdges = parsed.edges.filter(
              (e) => !preExistingEdgeIds.has(e.id) && !streamedIdsRef.current.edges.has(e.id)
            );

            if (newNodes.length > 0 || labelUpdates.size > 0) {
              newNodes.forEach((n) => streamedIdsRef.current.nodes.add(n.id));
              setNodes((prev) => {
                const refreshed = prev.map((n) =>
                  labelUpdates.has(n.id) && labelUpdates.get(n.id) !== n.data.label
                    ? { ...n, data: { ...n.data, label: labelUpdates.get(n.id) } }
                    : n
                );
                if (newNodes.length === 0) return refreshed;
                return [
                  ...refreshed,
                  ...newNodes.map((n) => ({
                    ...n,
                    position: { x: offsetX + n.position.x, y: offsetY + n.position.y },
                    data: { ...n.data, freshlyAdded: true, animateDelay: 0 },
                  })),
                ];
              });
            }
            if (newEdges.length > 0) {
              newEdges.forEach((e) => streamedIdsRef.current.edges.add(e.id));
              setEdges((prev) => [...prev, ...newEdges]);
            }
          },
          onRetry: (attempt) => {
            setRetryCount(attempt);
            streamingTextRef.current = '';
            setStreamingText('');
            setStreamingGraph(null);
            rollbackStreamedGraph();
          },
          signal: controller.signal,
        });

        const { dslText, layoutedNodes, layoutedEdges } = result;
        if (result.diagnostics?.length) {
          // The model's output still had unparseable lines after self-repair;
          // we kept the valid nodes and dropped the rest. Tell the user.
          notifyOperationOutcome(addToast, {
            status: 'warning',
            summary: `AI 生成的图有 ${result.diagnostics.length} 行无法解析,已跳过并保留 ${layoutedNodes.length} 个节点`,
          });
        }
        if (showPreview) {
          const previewDiff = computeImportDiff(
            nodes,
            result,
            requestKind,
            previewDescriptor,
            assetMatches
          );
          setPendingDiff(previewDiff);
          appendThreadItem(
            createPreviewThreadItem(dslText, {
              copyKey: previewDiff.copyKey,
              previewTitle: previewDiff.previewTitle,
              previewDetailKey: previewDiff.previewDetailKey,
              previewDetail: previewDiff.previewDetail,
              previewStats: previewDiff.previewStats,
              assetMatches,
            })
          );
          notifyOperationOutcome(addToast, {
            status: 'success',
            summary: tThread(previewDiff.copyKey),
            detail: previewDiff.previewDetailKey
              ? tPreviewDetail(previewDiff.previewDetailKey)
              : previewDiff.previewDetail,
          });
          captureAnalyticsEvent('import_preview_ready', {
            provider: aiSettings.provider || 'gemini',
            request_kind: requestKind,
          });
        } else {
          applyComposedGraph(layoutedNodes, layoutedEdges);
          appendThreadItem(
            createAppliedThreadItem('appliedToCanvas', getSuccessSummary(nodes.length, focusedNodeIds))
          );
          notifyOperationOutcome(addToast, {
            status: 'success',
            summary: tThread('appliedToCanvas'),
          });
        }
        captureAnalyticsEvent('ai_generation_succeeded', {
          provider: aiSettings.provider || 'gemini',
          has_image: Boolean(imageBase64),
          is_preview: showPreview,
          request_kind: requestKind,
          selected_count: focusedNodeIds?.length ?? selectedNodeIds.length,
        });
        return true;
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          captureAnalyticsEvent('ai_generation_cancelled', {
            provider: aiSettings.provider || 'gemini',
            is_preview: showPreview,
            request_kind: requestKind,
          });
          return false;
        }
        rollbackStreamedGraph();
        const errorMessage = toErrorMessage(error);
        logger.error('AI generation failed.', { error });
        setLastError(errorMessage);
        appendThreadItem(createErrorThreadItem(errorMessage));
        captureAnalyticsEvent('ai_generation_failed', {
          provider: aiSettings.provider || 'gemini',
          is_preview: showPreview,
          request_kind: requestKind,
          error_name: error instanceof Error ? error.name : 'UnknownError',
        });
        notifyOperationOutcome(addToast, {
          status: 'error',
          summary: getFailureSummary(nodes.length, focusedNodeIds),
          detail: errorMessage,
        });
        return false;
      } finally {
        abortControllerRef.current = null;
        setIsGenerating(false);
        streamingTextRef.current = '';
        setStreamingText(null);
        setStreamingGraph(null);
        setStreamingActive(false);
        setRetryCount(0);
        streamedIdsRef.current = { nodes: new Set(), edges: new Set() };
      }
    },
    [
      addToast,
      aiSettings,
      appendThreadItem,
      chatMessages,
      edges,
      globalEdgeOptions,
      readiness,
      nodes,
      selectedNodeIds,
      recordHistory,
      applyComposedGraph,
      setNodes,
      setEdges,
    ]
  );

  const handleAIRequest = useCallback(
    async (prompt: string, imageBase64?: string): Promise<boolean> => {
      const userThreadItem = createUserThreadItem(prompt, imageBase64);
      appendThreadItem(userThreadItem);

      const plan = buildFlowpilotPlan({
        prompt,
        nodeCount: nodes.length,
        selectedNodeCount: selectedNodeIds.length,
        hasImage: Boolean(imageBase64),
        preferDiagram: true,
      });
      appendThreadItem(createPlanThreadItem(plan));

      const assetMatches =
        plan.mode === 'asset_suggestions' || plan.mode === 'diagram_preview'
          ? await groundFlowpilotAssets(prompt)
          : [];

      if (plan.mode === 'asset_suggestions') {
        const assetSummary = assetMatches.length > 0
          ? `${tThread('assetMatchesFound')}: ${summarizeAssetGrounding(assetMatches)}.`
          : tThread('assetMatchesNone');
        appendThreadItem(createAnswerThreadItem(assetSummary, 'asset_suggestions', assetMatches));
        return true;
      }

      if (plan.mode === 'answer' || plan.mode === 'plan' || plan.mode === 'clarification') {
        return runConversationRequest(prompt, plan.mode === 'plan' ? 'plan' : 'answer', assetMatches, imageBase64);
      }

      return runDiagramRequest(prompt, imageBase64, undefined, false, 'prompt', undefined, undefined, assetMatches);
    },
    [
      appendThreadItem,
      nodes.length,
      runConversationRequest,
      runDiagramRequest,
      selectedNodeIds.length,
    ]
  );

  const handleFocusedAIRequest = useCallback(
    async (prompt: string, focusedNodeIds: string[], imageBase64?: string): Promise<boolean> => {
      appendThreadItem(createUserThreadItem(prompt, imageBase64));
      appendThreadItem(
        createPlanThreadItem(
          buildFlowpilotPlan({
            prompt,
            nodeCount: nodes.length,
            selectedNodeCount: focusedNodeIds.length,
            hasImage: Boolean(imageBase64),
            preferDiagram: true,
          })
        )
      );
      const assetMatches = await groundFlowpilotAssets(prompt);
      return runDiagramRequest(
        prompt,
        imageBase64,
        focusedNodeIds,
        false,
        'focused-edit',
        undefined,
        undefined,
        assetMatches
      );
    },
    [appendThreadItem, nodes.length, runDiagramRequest]
  );

  const handleCodeAnalysis = useCallback(
    async (code: string, language: SupportedLanguage): Promise<boolean> => {
      return runDiagramRequest(
        buildCodeToArchitecturePrompt({ code, language }),
        undefined,
        undefined,
        false,
        'code-import'
      );
    },
    [runDiagramRequest]
  );

  const handleSqlAnalysis = useCallback(
    async (sql: string): Promise<boolean> => {
      return runDiagramRequest(buildSqlToErdPrompt(sql), undefined, undefined, false, 'sql-import');
    },
    [runDiagramRequest]
  );

  const handleTerraformAnalysis = useCallback(
    async (input: string, format: TerraformInputFormat): Promise<boolean> => {
      return runDiagramRequest(
        buildTerraformToCloudPrompt(input, format),
        undefined,
        undefined,
        false,
        'terraform-import'
      );
    },
    [runDiagramRequest]
  );

  const handleOpenApiAnalysis = useCallback(
    async (spec: string): Promise<boolean> => {
      return runDiagramRequest(
        buildOpenApiToSequencePrompt(spec),
        undefined,
        undefined,
        false,
        'openapi-import'
      );
    },
    [runDiagramRequest]
  );

  const handleCodebaseAnalysis = useCallback(
    async (analysis: CodebaseAnalysis): Promise<boolean> => {
      const nativeDiagram = buildCodebaseNativeDiagram(analysis);

      return runDiagramRequest(
        buildCodebaseToArchitecturePrompt({
          summary: analysis.summary,
          cloudPlatform: analysis.cloudPlatform,
          detectedServices: analysis.detectedServices,
          infraFiles: analysis.infraFiles,
        }) +
          '\n\nUse the provided native repository diagram as the starting point. Preserve useful sections and module structure, then enhance it with platform services, clearer labels, and semantic edges.',
        undefined,
        undefined,
        true,
        'code-import',
        nativeDiagram.dsl,
        buildCodebasePreviewDescriptor(analysis, nativeDiagram)
      );
    },
    [runDiagramRequest]
  );

  return {
    isGenerating,
    streamingText,
    retryCount,
    cancelGeneration,
    pendingDiff,
    confirmPendingDiff,
    discardPendingDiff,
    readiness,
    lastError,
    handleAIRequest,
    handleFocusedAIRequest,
    handleCodeAnalysis,
    handleSqlAnalysis,
    handleTerraformAnalysis,
    handleOpenApiAnalysis,
    handleCodebaseAnalysis,
    chatMessages,
    assistantThread,
    clearChat,
    clearLastError,
  };
}
