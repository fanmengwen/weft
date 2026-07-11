import { fireEvent, render, screen, within } from '@testing-library/react';
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

function getToolbarButtons(container: HTMLElement): HTMLElement[] {
  const rail = container.querySelector('[data-testid="toolbar-rail"]');
  if (!(rail instanceof HTMLElement)) {
    throw new Error('toolbar rail not found');
  }
  return within(rail)
    .getAllByRole('button')
    .filter((button) => button.getAttribute('data-testid')?.startsWith('toolbar-'));
}

describe('Toolbar', () => {
  it('renders five vertical tool groups in spec order', () => {
    const { container } = render(<Toolbar {...createProps()} />);
    const buttons = getToolbarButtons(container);

    expect(buttons.map((button) => button.getAttribute('data-testid'))).toEqual([
      'toolbar-select',
      'toolbar-pan',
      'toolbar-add',
      'toolbar-layout',
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