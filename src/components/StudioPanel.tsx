import React, { lazy, Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { ChatMessage } from '@/services/aiService';
import type { AssistantThreadItem } from '@/services/flowpilot/types';
import type { AIReadinessState } from '@/hooks/ai-generation/readiness';
import type { ImportDiff } from '@/hooks/useAIGeneration';
import { SidebarBody, SidebarHeader, SidebarShell } from './SidebarShell';

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
    nodes,
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
    onClearChat,
    selectedNode,
    selectedNodeCount,
    onViewProperties,
    playback: _playback,
    initialPrompt,
    onInitialPromptConsumed,
}: StudioPanelProps): React.ReactElement {
    return (
        <SidebarShell>
            <SidebarHeader title="Studio" onClose={onClose} />

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

            <SidebarBody scrollable={false} className="px-4 py-3">
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
                        onClearChat={onClearChat}
                        nodeCount={nodes.length}
                        selectedNodeCount={selectedNodeCount}
                        initialPrompt={initialPrompt}
                        onInitialPromptConsumed={onInitialPromptConsumed}
                    />
                </Suspense>
            </SidebarBody>
        </SidebarShell>
    );
}
