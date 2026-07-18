import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StudioPanel } from './StudioPanel';

vi.mock('./StudioAIPanel', () => ({
  StudioAIPanel: () => <div data-testid="studio-ai-panel" />,
}));

function createProps(): React.ComponentProps<typeof StudioPanel> {
  return {
    onClose: vi.fn(),
    nodes: [],
    edges: [],
    onApply: vi.fn(),
    onAIGenerate: vi.fn(async () => true),
    isGenerating: false,
    streamingText: null,
    retryCount: 0,
    cancelGeneration: vi.fn(),
    pendingDiff: null,
    onConfirmDiff: vi.fn(),
    onDiscardDiff: vi.fn(),
    aiReadiness: {
      canGenerate: true,
      blockingIssue: null,
      advisory: null,
    },
    lastAIError: null,
    onClearAIError: vi.fn(),
    chatMessages: [],
    assistantThread: [],
    onClearChat: vi.fn(),
    selectedNode: null,
    selectedNodeCount: 0,
    onViewProperties: vi.fn(),
    playback: {
      currentStepIndex: -1,
      totalSteps: 0,
      isPlaying: false,
      onStartPlayback: vi.fn(),
      onPlayPause: vi.fn(),
      onStop: vi.fn(),
      onScrubToStep: vi.fn(),
      onNext: vi.fn(),
      onPrev: vi.fn(),
      playbackSpeed: 2000,
      onPlaybackSpeedChange: vi.fn(),
    },
  };
}

describe('StudioPanel', () => {
  it('renders the AI workspace without studio tabs', async () => {
    render(<StudioPanel {...createProps()} />);

    expect(screen.getByText('AI assistant')).toBeTruthy();
    expect(screen.queryByText('Code')).toBeNull();
    expect(await screen.findByTestId('studio-ai-panel')).toBeTruthy();
  });

  it('calls onClearChat when the clear conversation button is clicked', () => {
    const props = createProps();
    render(<StudioPanel {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }));

    expect(props.onClearChat).toHaveBeenCalledTimes(1);
  });
});

