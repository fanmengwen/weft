import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FlowEditorMode } from '@/hooks/useFlowEditorUIState';
import { Toolbar } from './Toolbar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

function createProps() {
  const editorMode: FlowEditorMode = 'canvas';

  return {
    onUndo: vi.fn(),
    canUndo: true,
    onRedo: vi.fn(),
    canRedo: true,
    onToggleSelectMode: vi.fn(),
    isSelectMode: true,
    onTogglePanMode: vi.fn(),
    onOpenAssets: vi.fn(),
    onAddShape: vi.fn(),
    onAddAnnotation: vi.fn(),
    onAddSection: vi.fn(),
    onLayout: vi.fn(),
    getCenter: () => ({ x: 200, y: 100 }),
    isCommandBarOpen: false,
    editorMode,
    isElementPaletteOpen: false,
    onToggleElementPalette: vi.fn(),
    onCloseElementPalette: vi.fn(),
  };
}

function getRailChildMarkers(container: HTMLElement): string[] {
  const rail = container.querySelector('[data-testid="toolbar-rail"]');
  if (!(rail instanceof HTMLElement)) {
    throw new Error('toolbar rail not found');
  }

  return [...rail.children].map((child) => {
    if (child.getAttribute('data-testid') === 'toolbar-divider') {
      return 'divider';
    }

    const button = child.matches('button')
      ? child
      : child.querySelector('button[data-testid^="toolbar-"]');
    return button?.getAttribute('data-testid') ?? child.tagName.toLowerCase();
  });
}

describe('Toolbar', () => {
  it('renders three tool clusters separated by two dividers in spec order', () => {
    const { container } = render(<Toolbar {...createProps()} />);

    expect(getRailChildMarkers(container)).toEqual([
      'toolbar-select',
      'toolbar-pan',
      'divider',
      'toolbar-add',
      'toolbar-layout',
      'divider',
      'toolbar-undo',
      'toolbar-redo',
    ]);
  });

  it('does not render removed toolbar buttons', () => {
    render(<Toolbar {...createProps()} />);

    expect(screen.queryByLabelText('Assets')).toBeNull();
    expect(screen.queryByLabelText('Open Command Center')).toBeNull();
    expect(screen.queryByLabelText('AI Assistant (Cmd+K)')).toBeNull();
    expect(screen.queryByTestId('toolbar-add-toggle')).toBeNull();
  });

  it('toggles element palette visibility and rotates the add icon when open', () => {
    const onToggleElementPalette = vi.fn();
    const { rerender } = render(
      <Toolbar {...createProps()} onToggleElementPalette={onToggleElementPalette} />
    );

    fireEvent.click(screen.getByTestId('toolbar-add'));
    expect(onToggleElementPalette).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('element-palette')).toBeNull();

    rerender(
      <Toolbar
        {...createProps()}
        isElementPaletteOpen
        onToggleElementPalette={onToggleElementPalette}
      />
    );

    expect(screen.getByTestId('element-palette')).toBeTruthy();
    const addIcon = screen.getByTestId('toolbar-add-icon');
    expect(addIcon.getAttribute('class') ?? '').toContain('rotate-45');
  });
});
