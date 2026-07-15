import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowStore } from '@/store';
import { NavigationControls } from './NavigationControls';

const zoomTo = vi.fn();
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
      zoomTo,
      fitView,
    }),
    useViewport: () => ({ zoom: 1 }),
  };
});

describe('NavigationControls', () => {
  beforeEach(() => {
    zoomTo.mockClear();
    fitView.mockClear();
    useFlowStore.getState().setShortcutsHelpOpen(false);
  });

  it('zooms in by 20% when the zoom-in control is clicked', () => {
    render(<NavigationControls />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]!);
    expect(zoomTo).toHaveBeenCalledWith(1.2, { duration: 300 });
  });

  it('zooms out by 20% when the zoom-out control is clicked', () => {
    render(<NavigationControls />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]!);
    expect(zoomTo).toHaveBeenCalledWith(0.8, { duration: 300 });
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
