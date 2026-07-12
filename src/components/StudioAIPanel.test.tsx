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
        nodeCount={3}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByRole('button', { name: 'Edit current' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Create new' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the import-content dsl block with a confirm bar', () => {
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
          dslText: 'flow: "Repo Enhancement"',
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
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByText('flow: "Repo Enhancement"')).toBeInTheDocument();
    expect(screen.getByText('导入已就绪，请检查变更后再应用')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply to canvas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('renders the applied status card when the canvas has nodes and edges', () => {
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
        nodeCount={4}
        edgeCount={2}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByText('已应用到画布')).toBeInTheDocument();
    expect(screen.getByText('4 个节点 · 2 条连线')).toBeInTheDocument();
  });

  it('renders a generating indicator while AI is working', () => {
    render(
      <StudioAIPanel
        onAIGenerate={vi.fn().mockResolvedValue(false)}
        isGenerating={true}
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
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    expect(
      screen.getByText('Understanding the request and preparing a diagram preview.')
    ).toBeInTheDocument();
  });

  it('renders three labeled studio sections', () => {
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
        nodeCount={0}
        selectedNodeCount={0}
      />
    );

    expect(screen.getByText('导入内容')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.getByText('AI 修改')).toBeInTheDocument();
  });
});
