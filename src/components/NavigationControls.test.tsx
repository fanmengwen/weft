import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowStore } from '@/store';
import { NavigationControls } from './NavigationControls';

const zoomIn = vi.fn();
const zoomOut = vi.fn();
const fitView = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/lib/reactflowCompat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/reactflowCompat')>();

  return {
    ...actual,
    useReactFlow: () => ({
      zoomIn,
      zoomOut,
      fitView,
    }),
    useViewport: () => ({ zoom: 1 }),
  };
});

describe('NavigationControls', () => {
  beforeEach(() => {
    zoomIn.mockClear();
    zoomOut.mockClear();
    fitView.mockClear();
    useFlowStore.getState().setShortcutsHelpOpen(false);
  });

  it('calls zoomIn when the zoom-in control is clicked', () => {
    render(<NavigationControls />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]!);
    expect(zoomIn).toHaveBeenCalledWith({ duration: 300 });
  });

  it('calls zoomOut when the zoom-out control is clicked', () => {
    render(<NavigationControls />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]!);
    expect(zoomOut).toHaveBeenCalledWith({ duration: 300 });
  });

  it('calls fitView when the fit-view control is clicked', () => {
    render(<NavigationControls />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]!);
    expect(fitView).toHaveBeenCalledWith({ duration: 600, padding: 0.2 });
  });

  it('opens the shortcuts help modal when the help control is clicked', () => {
    render(<NavigationControls />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[3]!);
    expect(useFlowStore.getState().viewSettings.isShortcutsHelpOpen).toBe(true);
  });
});
