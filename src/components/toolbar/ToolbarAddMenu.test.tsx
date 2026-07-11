import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToolbarAddMenu } from './ToolbarAddMenu';
import { ToolbarAddMenuPanel } from './ToolbarAddMenuPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

function createProps() {
  return {
    currentItemId: 'process' as const,
    isInteractive: true,
    showAddMenu: false,
    onToggleMenu: vi.fn(),
    onCloseMenu: vi.fn(),
    onCurrentItemChange: vi.fn(),
    getCenter: () => ({ x: 240, y: 120 }),
    onAddShape: vi.fn(),
    onAddAnnotation: vi.fn(),
    onAddSection: vi.fn(),
  };
}

describe('ToolbarAddMenu', () => {
  it('shows the current tool on the single add button', () => {
    const props = createProps();

    render(<ToolbarAddMenu {...props} />);
    expect(screen.getByTestId('toolbar-add-toggle')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-add-primary')).toBeNull();
  });

  it('uses the process tool as the default current icon', () => {
    const props = createProps();

    render(<ToolbarAddMenu {...props} />);
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeTruthy();
  });

  it('surfaces toolbar items from the shared registry', () => {
    const onSelectItem = vi.fn();

    render(
      <ToolbarAddMenuPanel
        currentItemId="process"
        onSelectItem={onSelectItem}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Decision' }));
    expect(onSelectItem).toHaveBeenCalledWith('decision');
  });

  it('menu selection updates the tool and inserts it', () => {
    const props = createProps();
    render(
      <ToolbarAddMenuPanel
        currentItemId="process"
        onSelectItem={(itemId) => {
          props.onCurrentItemChange(itemId);
          if (itemId === 'decision') {
            props.onAddShape({ type: 'decision', shape: 'diamond' }, { x: 240, y: 120 });
          }
          props.onCloseMenu();
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Decision' }));
    expect(props.onCurrentItemChange).toHaveBeenCalledWith('decision');
    expect(props.onAddShape).toHaveBeenCalledWith(
      { type: 'decision', shape: 'diamond' },
      { x: 240, y: 120 },
    );
    expect(props.onCloseMenu).toHaveBeenCalled();
  });
});
