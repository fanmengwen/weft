import '@testing-library/jest-dom/vitest';
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StudioAIPanel } from './StudioAIPanel';
import { createStudioAIPanelTestT } from './studioAIPanelTestI18n';

const handleGenerateMock = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: createStudioAIPanelTestT,
  }),
}));

vi.mock('./command-bar/useAIViewState', () => ({
  useAIViewState: () => ({
    prompt: 'Add Redis between API and DB',
    setPrompt: vi.fn(),
    selectedImage: null,
    setSelectedImage: vi.fn(),
    fileInputRef: createRef<HTMLInputElement>(),
    scrollRef: createRef<HTMLDivElement>(),
    handleGenerate: handleGenerateMock,
    handleKeyDown: vi.fn(),
    handleImageSelect: vi.fn(),
  }),
}));

describe('StudioAIPanel', () => {
  it('shows the settings CTA when ai is unavailable', () => {
    handleGenerateMock.mockReset();
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: false,
          blockingIssue: null,
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByRole('button', { name: 'Add AI key to start generating' })).toBeInTheDocument();
  });

  it('opens settings instead of generating when AI is not configured', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: false,
          blockingIssue: {
            tone: 'error',
            title: 'OpenAI is not ready yet',
            detail: 'Add your OpenAI API key in Settings before generating.',
          },
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={3}
        selectedNodeCount={0}
      />
    );

    expect(screen.queryByText('OpenAI is not ready yet')).not.toBeInTheDocument();
    expect(screen.queryByText('Add your OpenAI API key in Settings before generating.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEventSpy.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect((dispatchEventSpy.mock.calls[0]?.[0] as CustomEvent).type).toBe('open-ai-settings');

    dispatchEventSpy.mockRestore();
  });

  it('removes the inline create/edit explainer copy', () => {
    const onClearError = vi.fn();

    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError="The provider rejected this request."
        onClearError={onClearError}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={1}
        selectedNodeCount={0}
      />
    );

    expect(screen.queryByText(/Create mode replaces the canvas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Describe one concrete change at a time/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Update auth service' } });
    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it('shows AI recovery actions for request failures', () => {
    handleGenerateMock.mockReset();
    const onClearError = vi.fn();

    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError="The provider rejected this request."
        onClearError={onClearError}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={1}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByText('Last request failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry request' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry request' }));
    expect(handleGenerateMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss AI error' }));
    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it('offers AI settings recovery for setup-style failures', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: false,
          blockingIssue: {
            tone: 'error',
            title: 'OpenAI is not ready yet',
            detail: 'Add your OpenAI API key in Settings before generating.',
          },
          advisory: null,
        }}
        lastError="Failed to fetch"
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={1}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByRole('button', { name: 'Review AI settings' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review AI settings' }));

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect((dispatchEventSpy.mock.calls[0]?.[0] as CustomEvent).type).toBe('open-ai-settings');

    dispatchEventSpy.mockRestore();
  });

  it('opens settings from the empty-state CTA', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: false,
          blockingIssue: null,
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add AI key to start generating' }));

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEventSpy.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect((dispatchEventSpy.mock.calls[0]?.[0] as CustomEvent).type).toBe('open-ai-settings');

    dispatchEventSpy.mockRestore();
  });

  it('renders the active generation mode with selected segmented styling', () => {
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={3}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByRole('button', { name: 'Edit current' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Create new' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows preview copy for repo enhancement diffs', () => {
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={{
          addedCount: 4,
          updatedCount: 6,
          removedCount: 0,
          copyKey: 'codeEnhancementReady',
          previewDetailKey: 'codeEnhancementWithChanges',
          previewStats: ['Platform: aws', '4 native sections', '3 platform services'],
          result: {
            dslText: '',
            userMessage: { role: 'user', parts: [{ text: 'test' }] },
            layoutedNodes: [],
            layoutedEdges: [],
          },
        }}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[]}
        onClearChat={vi.fn()}
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByText('代码库增强预览已就绪，请检查升级后的图表')).toBeInTheDocument();
    expect(screen.getByText('已基于原生仓库结构图叠加 AI 架构增强。')).toBeInTheDocument();
    expect(screen.getByText('Platform: aws')).toBeInTheDocument();
    expect(screen.getByText('4 native sections')).toBeInTheDocument();
  });

  it('renders assistant plan cards from the richer thread model', () => {
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[
          {
            id: 'plan-1',
            role: 'model',
            type: 'assistant_plan',
            content: 'The request needs a plan before changing the canvas.',
            createdAt: '2026-03-31T00:00:00.000Z',
            responseMode: 'plan',
            thinkingState: 'planning',
            plan: {
              goal: 'Plan the architecture',
              mode: 'plan',
              steps: ['Inspect the current diagram', 'Outline the recommended structure'],
              requiresApproval: false,
              intendedOutput: 'Structured plan and next-step options',
              confidence: 0.88,
              reasoningSummary: 'The request needs a plan before changing the canvas.',
              skillId: 'plan_diagram',
            },
          },
        ]}
        onClearChat={vi.fn()}
        nodeCount={4}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByText('处理步骤')).toBeInTheDocument();
    expect(screen.getByText('模式: 计划')).toBeInTheDocument();
    expect(screen.getByText('1. 检查当前画布上下文')).toBeInTheDocument();
  });

  it('renders a minimal localized plan card for diagram preview routes', () => {
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[
          {
            id: 'plan-diagram',
            role: 'model',
            type: 'assistant_plan',
            content: 'The request should produce a diagram preview for review before applying to the canvas.',
            createdAt: '2026-03-31T00:00:00.000Z',
            responseMode: 'diagram_preview',
            thinkingState: 'planning',
            plan: {
              goal: 'Draw two boxes',
              mode: 'diagram_preview',
              steps: ['Inspect the current canvas context', 'Outline the recommended structure'],
              requiresApproval: true,
              intendedOutput: 'Canvas preview with review/apply controls',
              confidence: 0.84,
              reasoningSummary:
                'The request should produce a diagram preview for review before applying to the canvas.',
              skillId: 'plan_diagram',
            },
          },
        ]}
        onClearChat={vi.fn()}
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByText('图表生成')).toBeInTheDocument();
    expect(
      screen.getByText('图表草稿已就绪，请在上方确认后应用到画布。')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Mode:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Confidence:/)).not.toBeInTheDocument();
  });

  it('hides asset grounding labels on diagram preview messages', () => {
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={false}
        streamingText={null}
        retryCount={0}
        onCancelGeneration={vi.fn()}
        pendingDiff={null}
        onConfirmDiff={vi.fn()}
        onDiscardDiff={vi.fn()}
        aiReadiness={{
          canGenerate: true,
          blockingIssue: null,
          advisory: null,
        }}
        lastError={null}
        onClearError={vi.fn()}
        chatMessages={[]}
        assistantThread={[
          {
            id: 'preview-1',
            role: 'model',
            type: 'assistant_canvas_preview',
            content: 'flow: "Untitled Flow"',
            createdAt: '2026-03-31T00:00:00.000Z',
            responseMode: 'diagram_preview',
            copyKey: 'importReady',
            assetMatches: [
              {
                id: 'aws-datacenter',
                label: 'Architecture Group Corporate Data Center',
                description: 'AWS grouping icon',
                category: 'aws',
                confidence: 0.82,
                reasoning: 'Matched local asset',
              },
            ],
          },
        ]}
        onClearChat={vi.fn()}
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    expect(screen.queryByText('Architecture Group Corporate Data Center')).not.toBeInTheDocument();
    expect(screen.getByText('导入已就绪，请检查变更后再应用')).toBeInTheDocument();
  });
});
