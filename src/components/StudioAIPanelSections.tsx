import type { ReactElement, RefObject } from 'react';
import {
  AlertTriangle,
  ArrowUp,
  Check,
  Crosshair,
  Info,
  Key,
  Loader2,
  Paperclip,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { ChatMessage } from '@/services/aiService';
import type { AssistantThreadItem } from '@/services/flowpilot/types';
import type { ImportDiff } from '@/hooks/useAIGeneration';
import type { AIReadinessState } from '@/hooks/ai-generation/readiness';
import { useStreamingState } from '@/hooks/ai-generation/streamingStore';
import { SECTION_SURFACE_CLASS, STATUS_SURFACE_CLASS } from '@/lib/designTokens';
import { STUDIO_AI_COPY } from './studioAICopy';
import {
  STUDIO_EMPTY_PROMPT_EXAMPLES,
  type StudioEmptyPromptExample,
} from './studioEmptyPromptExamples';

export type AIGenerationMode = 'edit' | 'create';
type TranslateFn = (...args: unknown[]) => string;

interface ImportContentSectionProps {
  pendingDiff: ImportDiff;
  onConfirmDiff: () => void;
  onDiscardDiff: () => void;
  t: TranslateFn;
}

export function ImportContentSection({
  pendingDiff,
  onConfirmDiff,
  onDiscardDiff,
  t,
}: ImportContentSectionProps): ReactElement {
  return (
    <div>
      <pre
        className="overflow-y-auto whitespace-pre-wrap break-words rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] p-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[11.5px] leading-[1.65] text-[#4A5361]"
        style={{ maxHeight: '218px' }}
      >
        {pendingDiff.dslText}
      </pre>
      <div
        className="mt-2.5 flex items-center gap-[7px] rounded-[8px] px-2.5 py-2"
        style={{
          background: 'color-mix(in srgb, var(--wf-acc) 7%, #FFFFFF)',
          border: '1px solid color-mix(in srgb, var(--wf-acc) 18%, #FFFFFF)',
        }}
      >
        <Info className="h-[13px] w-[13px] shrink-0 text-[var(--wf-acc)]" />
        <span className="text-[12px] leading-[1.45] text-[#3E4753]">
          导入已就绪，请检查变更后再应用
        </span>
      </div>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onDiscardDiff}
          className="flex h-7 flex-1 items-center justify-center rounded text-[11px] font-medium text-[#5C6572] hover:bg-[#F3F5F8]"
        >
          {t('commandBar.aiStudio.discard', 'Discard')}
        </button>
        <button
          type="button"
          onClick={onConfirmDiff}
          className="flex h-7 flex-1 items-center justify-center rounded bg-[var(--wf-acc)] text-[11px] font-medium text-white hover:brightness-[0.94]"
        >
          {t('commandBar.aiStudio.applyToCanvas', 'Apply to canvas')}
        </button>
      </div>
    </div>
  );
}

function getStreamingStatusCopy(
  streamingText: string | null,
  retryCount: number,
  chatMessageCount: number,
  t: TranslateFn
): string {
  if (retryCount > 0) {
    return t('commandBar.aiStudio.retrying', {
      retryCount,
      defaultValue: 'Retrying ({{retryCount}} of 3)...',
    });
  }

  if (chatMessageCount > 0) {
    return t('commandBar.aiStudio.thread.streaming.inspectCanvas', {
      defaultValue: 'Inspecting the canvas, grounding assets, and preparing the next step.',
    });
  }

  if (streamingText) {
    return t('commandBar.aiStudio.thread.streaming.draftingResponse', {
      defaultValue: 'Understanding the request and drafting the response.',
    });
  }

  return t('commandBar.aiStudio.thread.streaming.decidingRoute', {
    defaultValue: 'Understanding the request and preparing a diagram preview.',
  });
}

interface StatusSectionProps {
  isGenerating: boolean;
  streamingText: string | null;
  retryCount: number;
  chatMessages: ChatMessage[];
  assistantThread: AssistantThreadItem[];
  pendingDiff: ImportDiff | null;
  nodeCount: number;
  edgeCount: number;
  canGenerate: boolean;
  onOpenAISettings: () => void;
  t: TranslateFn;
}

function getLastConversationalModelItem(
  assistantThread: AssistantThreadItem[]
): AssistantThreadItem | null {
  for (let index = assistantThread.length - 1; index >= 0; index -= 1) {
    const item = assistantThread[index];
    if (item.role !== 'model') {
      continue;
    }

    const conversational =
      item.type === 'assistant_lookup_result' ||
      item.type === 'assistant_recommendation' ||
      item.type === 'assistant_error' ||
      (item.type === 'assistant_plan' && item.responseMode === 'clarification');

    return conversational ? item : null;
  }

  return null;
}

function getConversationalContent(item: AssistantThreadItem): string {
  return item.plan?.reasoningSummary ?? item.summary ?? item.content;
}

export function StatusSection({
  isGenerating,
  streamingText,
  retryCount,
  chatMessages,
  assistantThread,
  pendingDiff,
  nodeCount,
  edgeCount,
  canGenerate,
  onOpenAISettings,
  t,
}: StatusSectionProps): ReactElement | null {
  // Preview flows (e.g. codebase import) still stream into the floating
  // overlay rather than the live canvas, so its count is the accurate one
  // while they're in flight; everything else writes straight to the canvas,
  // so the nodeCount/edgeCount props are already live for those.
  const { nodeCount: overlayNodeCount, edgeCount: overlayEdgeCount } = useStreamingState();

  if (pendingDiff != null) {
    return null;
  }

  if (isGenerating) {
    const liveNodeCount = overlayNodeCount > 0 ? overlayNodeCount : nodeCount;
    const liveEdgeCount = overlayNodeCount > 0 ? overlayEdgeCount : edgeCount;
    return (
      <div className="rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] p-3 text-[12px]">
        <div className="flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {getStreamingStatusCopy(streamingText, retryCount, chatMessages.length, t)}
        </div>
        {liveNodeCount > 0 ? (
          <div className="mt-2 text-[11.5px] text-[#8B93A0]">
            {liveNodeCount} 个节点 · {liveEdgeCount} 条连线
          </div>
        ) : null}
      </div>
    );
  }

  const lastModelItem = getLastConversationalModelItem(assistantThread);
  if (lastModelItem) {
    return (
      <div className="rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] p-3 text-[12px] leading-[1.5] text-[#4A5361] whitespace-pre-wrap">
        {getConversationalContent(lastModelItem)}
      </div>
    );
  }

  if (!canGenerate) {
    return (
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={onOpenAISettings}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[var(--brand-secondary)] transition-all hover:bg-[var(--brand-background)] hover:text-[var(--brand-text)] active:scale-95 ${SECTION_SURFACE_CLASS}`}
        >
          <Key className="h-3.5 w-3.5" />
          {t('commandBar.aiStudio.addKeyCta', 'Add AI key to start generating')}
        </button>
      </div>
    );
  }

  if (nodeCount > 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] px-3 py-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[var(--wf-t-out-bg)] text-[var(--wf-t-out-fg)]">
          <Check className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">已应用到画布</div>
          <div className="text-[11.5px] text-[#8B93A0]">
            {nodeCount} 个节点 · {edgeCount} 条连线
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface ComposerSectionProps {
  nodeCount: number;
  selectedNodeCount: number;
  effectiveGenerationMode: AIGenerationMode;
  selectedImage: string | null;
  prompt: string;
  placeholder: string;
  isGenerating: boolean;
  isInputEmpty: boolean;
  aiReadiness: AIReadinessState;
  lastError: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSetGenerationMode: (mode: AIGenerationMode) => void;
  onRemoveImage: () => void;
  onPromptChange: (value: string) => void;
  onPromptKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onAttachImage: () => void;
  onImageSelect: React.ChangeEventHandler<HTMLInputElement>;
  onOpenAISettings: () => void;
  onClearError: () => void;
  onCancelGeneration: () => void;
  onSubmit: () => void;
  sendButtonLabel: string;
  t: TranslateFn;
  hideInlineSend?: boolean;
}

const GENERATION_MODE_ACTIVE_CLASS =
  'flex flex-1 items-center justify-center gap-1 py-[5px] text-center text-[12.5px] font-semibold text-[var(--wf-text)] bg-white rounded-[7px] shadow-[0_1px_2px_rgba(16,24,40,0.10)]';
const GENERATION_MODE_INACTIVE_CLASS =
  'flex flex-1 items-center justify-center gap-1 py-[5px] text-center text-[12.5px] text-[var(--wf-text-label)] rounded-[7px]';
const INFO_ICON_CLASS = 'h-3.5 w-3.5 focus:outline-none text-[var(--wf-text-label)]';

function isLikelyNetworkFailure(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch') ||
    normalized.includes('cors') ||
    normalized.includes('rate limit') ||
    normalized.includes('timeout')
  );
}

interface AIRecoveryBannerProps {
  aiReadiness: AIReadinessState;
  lastError: string;
  isGenerating: boolean;
  onRetry: () => void;
  onOpenAISettings: () => void;
  onClearError: () => void;
}

function AIRecoveryBanner({
  aiReadiness,
  lastError,
  isGenerating,
  onRetry,
  onOpenAISettings,
  onClearError,
}: AIRecoveryBannerProps): ReactElement {
  const setupIssue = aiReadiness.blockingIssue;
  const showSettingsCta = Boolean(setupIssue) || isLikelyNetworkFailure(lastError);
  const detail = setupIssue?.detail ?? lastError;

  return (
    <div className={`mb-3 rounded-[var(--radius-md)] px-3 py-3 ${STATUS_SURFACE_CLASS.warning}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-surface-warning-text)]" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-[var(--color-surface-warning-text)]">
            {setupIssue?.title ?? STUDIO_AI_COPY.lastRequestFailedTitle}
          </div>
          <div className="mt-1 text-[11px] leading-4 text-[var(--color-surface-warning-text)]/90">{detail}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!isGenerating ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-amber-700"
              >
                Retry request
              </button>
            ) : null}
            {showSettingsCta ? (
              <button
                type="button"
                onClick={onOpenAISettings}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[var(--brand-background)] ${SECTION_SURFACE_CLASS}`}
              >
                Review AI settings
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClearError}
              className="rounded-full px-2 py-1.5 text-[11px] font-medium text-[var(--color-surface-warning-text)]/80 transition-colors hover:bg-[var(--brand-background)]"
              aria-label={STUDIO_AI_COPY.dismissErrorAriaLabel}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyCanvasHero({ t }: { t: TranslateFn }): ReactElement {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--wf-acc)_12%,#FFFFFF)] text-[var(--wf-acc)]">
        <Sparkles className="h-[22px] w-[22px]" strokeWidth={2} />
      </div>
      <div className="mt-3 text-[16px] font-semibold text-[var(--wf-text)]">
        {t('commandBar.aiStudio.emptyHeroTitle', 'Generate a diagram with AI')}
      </div>
      <div className="mt-1.5 text-[12.5px] leading-[1.55] text-[#6B7484]">
        {t(
          'commandBar.aiStudio.emptyHeroDescription',
          'Describe a process or system and AI will draft the full diagram for you.'
        )}
      </div>
    </div>
  );
}

export function EmptyCanvasPromptExamples({
  t,
  onPick,
}: {
  t: TranslateFn;
  onPick: (example: StudioEmptyPromptExample) => void;
}): ReactElement {
  return (
    <div data-testid="studio-empty-prompt-examples">
      <div className="mb-2.5 mt-[22px] text-[11px] tracking-[0.05em] text-[#98A1AE]">
        {t('commandBar.aiStudio.tryThese', 'Try these')}
      </div>
      <div className="flex flex-col gap-2">
        {STUDIO_EMPTY_PROMPT_EXAMPLES.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => onPick(example)}
            className="flex items-center gap-2.5 rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] px-3 py-2.5 text-left transition-colors hover:border-[#DDE0E6] hover:bg-[#F3F5F8]"
            data-testid={`studio-empty-example-${example.id}`}
          >
            <span
              className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] text-[13px]"
              style={{ background: example.bg, color: example.fg }}
              aria-hidden
            >
              {example.emoji}
            </span>
            <span className="text-[12.5px] leading-[1.4] text-[#3E4753]">
              {t(example.labelKey, example.labelDefault)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function EmptyCanvasGenerateButton({
  label,
  disabled,
  isGenerating,
  onClick,
  onCancel,
}: {
  label: string;
  disabled: boolean;
  isGenerating: boolean;
  onClick: () => void;
  onCancel: () => void;
}): ReactElement {
  if (isGenerating) {
    return (
      <button
        type="button"
        onClick={onCancel}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[#C4443C] text-[14px] font-semibold text-white transition-[filter] hover:brightness-[0.94]"
        data-testid="studio-empty-cancel-generate"
      >
        <Square className="h-3.5 w-3.5 fill-current" />
        <span>Cancel</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[var(--wf-acc)] text-[14px] font-semibold text-white transition-[filter] hover:brightness-[0.94] disabled:cursor-not-allowed disabled:opacity-50 animate-[aiPulse_2.6s_ease-in-out_infinite] disabled:animate-none"
      data-testid="studio-empty-generate"
    >
      <Sparkles className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

export function ComposerSection({
  nodeCount,
  selectedNodeCount,
  effectiveGenerationMode,
  selectedImage,
  prompt,
  placeholder,
  isGenerating,
  isInputEmpty,
  aiReadiness,
  lastError,
  fileInputRef,
  onSetGenerationMode,
  onRemoveImage,
  onPromptChange,
  onPromptKeyDown,
  onAttachImage,
  onImageSelect,
  onOpenAISettings,
  onClearError,
  onCancelGeneration,
  onSubmit,
  sendButtonLabel,
  t,
  hideInlineSend = false,
}: ComposerSectionProps): ReactElement {
  return (
    <div className="mt-2.5">
      {lastError ? (
        <AIRecoveryBanner
          aiReadiness={aiReadiness}
          lastError={lastError}
          isGenerating={isGenerating}
          onRetry={onSubmit}
          onOpenAISettings={onOpenAISettings}
          onClearError={onClearError}
        />
      ) : null}
      {nodeCount > 0 ? (
        <div className="mb-3 flex bg-[#F0F2F5] rounded-[9px] p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => onSetGenerationMode('edit')}
            className={
              effectiveGenerationMode === 'edit'
                ? GENERATION_MODE_ACTIVE_CLASS
                : GENERATION_MODE_INACTIVE_CLASS
            }
            aria-pressed={effectiveGenerationMode === 'edit'}
          >
            {t('commandBar.aiStudio.editCurrent', 'Edit current')}
            <Tooltip
              text={t('commandBar.aiStudio.editCurrentHint', 'Modify your existing canvas')}
              side="top"
              className="flex items-center"
            >
              <Info className={INFO_ICON_CLASS} />
            </Tooltip>
          </button>
          <button
            type="button"
            onClick={() => onSetGenerationMode('create')}
            className={
              effectiveGenerationMode === 'create'
                ? GENERATION_MODE_ACTIVE_CLASS
                : GENERATION_MODE_INACTIVE_CLASS
            }
            aria-pressed={effectiveGenerationMode === 'create'}
          >
            {t('commandBar.aiStudio.createNew', 'Create new')}
            <Tooltip
              text={t('commandBar.aiStudio.createNewHint', 'Start fresh with a new diagram')}
              side="top"
              className="flex items-center"
            >
              <Info className={INFO_ICON_CLASS} />
            </Tooltip>
          </button>
        </div>
      ) : null}

      {selectedNodeCount > 0 && effectiveGenerationMode === 'edit' ? (
        <div className="mb-3 flex items-center gap-1.5 rounded-[var(--radius-xs)] border border-[var(--brand-primary-100)] bg-[var(--brand-primary-50)] px-2.5 py-1.5">
          <Crosshair className="h-3 w-3 shrink-0 text-[var(--brand-primary)]" />
          <span className="text-[11px] font-medium text-[var(--brand-primary)]">
            {t('commandBar.aiStudio.editingSelectedNodes', {
              count: selectedNodeCount,
              defaultValue: 'Editing {{count}} selected node',
            })}
          </span>
        </div>
      ) : null}

      {selectedImage ? (
        <div className="group relative mb-3 h-16 w-16 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--brand-background)] shadow-sm">
          <img
            src={selectedImage}
            alt={t('commandBar.aiStudio.uploadPreviewAlt', 'Upload preview')}
            className="h-full w-full object-cover"
          />
          <button
            onClick={onRemoveImage}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <div className="flex w-full flex-col rounded-[10px] border border-[#D8DCE2] bg-white focus-within:border-[var(--wf-acc)]">
        <textarea
          value={prompt}
          onChange={(event) => {
            if (lastError) {
              // Preserve the existing error-clearing behavior in the parent callback chain.
            }
            onPromptChange(event.target.value);
          }}
          onKeyDown={onPromptKeyDown}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-[13px] leading-[1.55] text-[var(--wf-text)] placeholder-[#98A1AE] outline-none custom-scrollbar"
          style={{ minHeight: '76px', maxHeight: '180px' }}
          rows={3}
        />
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={onImageSelect}
            />
            <button
              onClick={onAttachImage}
              className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#8B93A0] hover:bg-[#F3F5F8]"
              title={t('commandBar.aiStudio.attachImage', 'Attach image')}
              type="button"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
          </div>
          {hideInlineSend ? (
            <div className="text-[11px] text-[#B0B6BF]">
              {t('commandBar.aiStudio.generateShortcut', '⌘↵ to generate')}
            </div>
          ) : isGenerating ? (
            <button
              onClick={onCancelGeneration}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[#C4443C] text-white hover:brightness-[0.94]"
              aria-label={t('commandBar.aiStudio.cancelGeneration', 'Cancel generation')}
              type="button"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={isInputEmpty}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[var(--wf-acc)] text-white hover:brightness-[0.94] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t('flowEditor.emptyState.generateWithFlowpilot', {
                defaultValue: 'Generate with AI',
              })}
              title={sendButtonLabel}
              type="button"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
