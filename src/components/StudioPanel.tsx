import React, { lazy, Suspense } from 'react';
import { ArrowRight, Sparkles, Trash2, X } from 'lucide-react';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { ChatMessage } from '@/services/aiService';
import type { AssistantThreadItem } from '@/services/flowpilot/types';
import type { AIReadinessState } from '@/hooks/ai-generation/readiness';
import type { ImportDiff } from '@/hooks/useAIGeneration';
import { SidebarBody, SidebarShell } from './SidebarShell';

const LazyStudioAIPanel = lazy(async () => {
    const module = await import('./StudioAIPanel');
    return { default: module.StudioAIPanel };
});

interface StudioPanelProps {
    onClose: () => void;
    nodes: FlowNode[];
    edges: FlowEdge[];
    onApply: (nodes: FlowNode[], edges: FlowEdge[]) => void;
    onAIGenerate: (prompt: string, imageBase64?: string) => Promise<boolean>;
    isGenerating: boolean;
    streamingText: string | null;
    retryCount: number;
    cancelGeneration: () => void;
    pendingDiff: ImportDiff | null;
    onConfirmDiff: () => void;
    onDiscardDiff: () => void;
    aiReadiness: AIReadinessState;
    lastAIError: string | null;
    onClearAIError: () => void;
    chatMessages: ChatMessage[];
    assistantThread: AssistantThreadItem[];
    onClearChat: () => void;
    selectedNode: FlowNode | null;
    selectedNodeCount: number;
    onViewProperties: () => void;
    playback: {
        currentStepIndex: number;
        totalSteps: number;
        isPlaying: boolean;
        onStartPlayback: () => void;
        onPlayPause: () => void;
        onStop: () => void;
        onScrubToStep: (index: number) => void;
        onNext: () => void;
        onPrev: () => void;
        playbackSpeed: number;
        onPlaybackSpeedChange: (durationMs: number) => void;
    };
    initialPrompt?: string;
    onInitialPromptConsumed?: () => void;
}


export function StudioPanel({
    onClose,
    onClearChat,
    nodes,
    edges,
    onApply: _onApply,
    onAIGenerate,
    isGenerating,
    streamingText,
    retryCount,
    cancelGeneration,
    pendingDiff,
    onConfirmDiff,
    onDiscardDiff,
    aiReadiness,
    lastAIError,
    onClearAIError,
    chatMessages,
    assistantThread,
    selectedNode,
    selectedNodeCount,
    onViewProperties,
    playback: _playback,
    initialPrompt,
    onInitialPromptConsumed,
}: StudioPanelProps): React.ReactElement {
    return (
        <SidebarShell>
            <div className="flex h-12 items-center justify-between border-b border-[#EEF0F4] pl-4 pr-3">
                <div className="flex items-center gap-[7px]">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--wf-acc)]" />
                    <span className="text-[14px] font-semibold text-[var(--wf-text)]">Studio</span>
                </div>
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={onClearChat}
                        aria-label="Clear conversation"
                        className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#8B93A0] transition-colors hover:bg-[#FBEFEE] hover:text-[#C4443C]"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#8B93A0] transition-colors hover:bg-[#F3F5F8] hover:text-[#4A5361]"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {selectedNode && (
                <button
                    onClick={onViewProperties}
                    className="flex w-full items-center justify-between border-b border-[var(--color-brand-border)] bg-[var(--brand-background)] px-4 py-2 text-left transition-colors hover:bg-[var(--brand-primary-50)]"
                >
                    <span className="truncate text-xs font-medium text-[var(--brand-secondary)]">
                        {(selectedNode.data as { label?: string }).label?.trim() || 'Selected node'}
                    </span>
                    <span className="ml-2 flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--brand-primary)]">
                        Properties <ArrowRight className="h-3 w-3" />
                    </span>
                </button>
            )}

            <SidebarBody scrollable={false} padded={false}>
                <Suspense fallback={null}>
                    <LazyStudioAIPanel
                        onAIGenerate={onAIGenerate}
                        isGenerating={isGenerating}
                        streamingText={streamingText}
                        retryCount={retryCount}
                        onCancelGeneration={cancelGeneration}
                        pendingDiff={pendingDiff}
                        onConfirmDiff={onConfirmDiff}
                        onDiscardDiff={onDiscardDiff}
                        aiReadiness={aiReadiness}
                        lastError={lastAIError}
                        onClearError={onClearAIError}
                        chatMessages={chatMessages}
                        assistantThread={assistantThread}
                        nodeCount={nodes.length}
                        edgeCount={edges.length}
                        selectedNodeCount={selectedNodeCount}
                        initialPrompt={initialPrompt}
                        onInitialPromptConsumed={onInitialPromptConsumed}
                    />
                </Suspense>
            </SidebarBody>
        </SidebarShell>
    );
}
