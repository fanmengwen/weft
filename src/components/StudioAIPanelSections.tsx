import type { ReactElement, RefObject } from 'react';
import {
  AlertTriangle,
  Check,
  Crosshair,
  Info,
  Key,
  Loader2,
  Paperclip,
  Square,
  X,
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import type { ChatMessage } from '@/services/aiService';
import type { AssistantThreadItem } from '@/services/flowpilot/types';
import type { ImportDiff } from '@/hooks/useAIGeneration';
import type { AIReadinessState } from '@/hooks/ai-generation/readiness';
import { SECTION_SURFACE_CLASS, STATUS_SURFACE_CLASS } from '@/lib/designTokens';
import { STUDIO_AI_COPY } from './studioAICopy';

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
  isCanvasEmpty: boolean;
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

    if (item.type === 'assistant_error') {
      return item;
    }

    if (item.type === 'assistant_plan') {
      const mode = item.responseMode ?? item.plan?.mode;
      if (mode === 'answer' || mode === 'clarification') {
        return item;
      }
    }
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
  isCanvasEmpty: _isCanvasEmpty,
  canGenerate,
  onOpenAISettings,
  t,
}: StatusSectionProps): ReactElement | null {
  if (pendingDiff != null) {
    return null;
  }

  if (isGenerating) {
    return (
      <div className="rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] p-3 text-[12px]">
        <div className="flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {getStreamingStatusCopy(streamingText, retryCount, chatMessages.length, t)}
        </div>
        {streamingText ? (
          <div className="mt-2 whitespace-pre-wrap text-[#8B93A0]">{streamingText}</div>
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
  isBeveled: boolean;
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
  sendButtonIcon: ReactElement;
  getGenerationModeButtonClassName: (isActive: boolean) => string;
  getInfoIconClassName: (isActive: boolean) => string;
  getPrimaryComposerClassName: (isInputEmpty: boolean, isBeveled: boolean) => string;
  t: TranslateFn;
}

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

export function ComposerSection({
  nodeCount,
  selectedNodeCount,
  effectiveGenerationMode,
  selectedImage,
  prompt,
  placeholder,
  isGenerating,
  isInputEmpty,
  isBeveled,
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
  sendButtonIcon,
  getGenerationModeButtonClassName,
  getInfoIconClassName,
  getPrimaryComposerClassName,
  t,
}: ComposerSectionProps): ReactElement {
  return (
    <div className="shrink-0 border-t border-[var(--color-brand-border)] px-1 pt-3">
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
        <div className="mb-3 flex rounded-[var(--radius-md)] border border-[var(--color-brand-border)]/80 bg-[var(--brand-background)]/80 p-1">
          <button
            onClick={() => onSetGenerationMode('edit')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] py-1.5 text-[13px] font-semibold transition-all ${getGenerationModeButtonClassName(effectiveGenerationMode === 'edit')}`}
            aria-pressed={effectiveGenerationMode === 'edit'}
          >
            {t('commandBar.aiStudio.editCurrent', 'Edit current')}
            <Tooltip
              text={t('commandBar.aiStudio.editCurrentHint', 'Modify your existing canvas')}
              side="top"
              className="flex items-center"
            >
              <Info className={getInfoIconClassName(effectiveGenerationMode === 'edit')} />
            </Tooltip>
          </button>
          <button
            onClick={() => onSetGenerationMode('create')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] py-1.5 text-[13px] font-semibold transition-all ${getGenerationModeButtonClassName(effectiveGenerationMode === 'create')}`}
            aria-pressed={effectiveGenerationMode === 'create'}
          >
            {t('commandBar.aiStudio.createNew', 'Create new')}
            <Tooltip
              text={t('commandBar.aiStudio.createNewHint', 'Start fresh with a new diagram')}
              side="top"
              className="flex items-center"
            >
              <Info className={getInfoIconClassName(effectiveGenerationMode === 'create')} />
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

      <div className="relative flex w-full flex-col rounded-[var(--brand-radius)] border border-[var(--color-brand-border)] bg-[var(--brand-surface)] shadow-sm transition-[border-color,box-shadow] focus-within:border-[var(--brand-primary)] focus-within:shadow-[0_0_0_1px_var(--brand-primary),0_0_0_4px_color-mix(in_srgb,var(--brand-primary)_16%,transparent)]">
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
          className="w-full resize-none rounded-[var(--brand-radius)] bg-transparent px-4 pb-12 pt-4 text-sm text-[var(--brand-text)] placeholder-[var(--brand-secondary)] outline-none custom-scrollbar"
          style={{ minHeight: '100px', maxHeight: '180px' }}
          rows={3}
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onImageSelect}
          />
          <button
            onClick={onAttachImage}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--brand-secondary)] transition-colors hover:bg-[var(--brand-background)] hover:text-[var(--brand-secondary)]"
            title={t('commandBar.aiStudio.attachImage', 'Attach image')}
            type="button"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {isGenerating ? (
            <button
              onClick={onCancelGeneration}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-all hover:bg-red-600 active:scale-95"
              aria-label={t('commandBar.aiStudio.cancelGeneration', 'Cancel generation')}
              type="button"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={isInputEmpty}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all flex-shrink-0 ${getPrimaryComposerClassName(isInputEmpty, isBeveled)} ${!isInputEmpty ? 'active:scale-95' : ''}`}
              aria-label={t('flowEditor.emptyState.generateWithFlowpilot', {
                defaultValue: 'Generate with AI',
              })}
              title={sendButtonLabel}
              type="button"
            >
              {sendButtonIcon}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
