import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInitialChartFitView } from './useInitialChartFitView';

describe('useInitialChartFitView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('centers content once when a tab first has nodes, preserving zoom', () => {
    const fitView = vi.fn();
    const getZoom = vi.fn(() => 1);

    const { rerender } = renderHook(
      (props: { nodeCount: number; activeTabId: string | null }) =>
        useInitialChartFitView({
          fitView,
          getZoom,
          activeTabId: props.activeTabId,
          nodeCount: props.nodeCount,
          delayMs: 50,
        }),
      { initialProps: { nodeCount: 3, activeTabId: 'tab-a' } }
    );

    expect(fitView).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fitView).toHaveBeenCalledTimes(1);
    expect(fitView).toHaveBeenCalledWith({
      padding: 0.2,
      duration: 0,
      minZoom: 1,
      maxZoom: 1,
    });

    rerender({ nodeCount: 5, activeTabId: 'tab-a' });
    vi.advanceTimersByTime(50);
    expect(fitView).toHaveBeenCalledTimes(1);
  });

  it('does not fit an empty canvas', () => {
    const fitView = vi.fn();
    renderHook(() =>
      useInitialChartFitView({
        fitView,
        getZoom: () => 1,
        activeTabId: 'tab-a',
        nodeCount: 0,
      })
    );
    vi.advanceTimersByTime(100);
    expect(fitView).not.toHaveBeenCalled();
  });

  it('fits again when switching to another tab with nodes', () => {
    const fitView = vi.fn();
    const { rerender } = renderHook(
      (props: { activeTabId: string }) =>
        useInitialChartFitView({
          fitView,
          getZoom: () => 0.8,
          activeTabId: props.activeTabId,
          nodeCount: 2,
          delayMs: 50,
        }),
      { initialProps: { activeTabId: 'tab-a' } }
    );

    vi.advanceTimersByTime(50);
    expect(fitView).toHaveBeenCalledTimes(1);

    rerender({ activeTabId: 'tab-b' });
    vi.advanceTimersByTime(50);
    expect(fitView).toHaveBeenCalledTimes(2);
    expect(fitView).toHaveBeenLastCalledWith({
      padding: 0.2,
      duration: 0,
      minZoom: 0.8,
      maxZoom: 0.8,
    });
  });
});
