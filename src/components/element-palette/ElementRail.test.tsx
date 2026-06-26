import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ElementRail } from './ElementRail';
import { WEFT_ADD_ITEM_MIME } from './elementPaletteDnD';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

function createAddItemActions() {
  return {
    onAddShape: vi.fn(),
    onAddAnnotation: vi.fn(),
    onAddSection: vi.fn(),
    onAddTextNode: vi.fn(),
    onAddClassNode: vi.fn(),
    onAddEntityNode: vi.fn(),
    onAddMindmapNode: vi.fn(),
    onAddJourneyNode: vi.fn(),
    onAddArchitectureNode: vi.fn(),
    onAddSequenceParticipant: vi.fn(),
    onAddWireframe: vi.fn(),
  };
}

function createProps(overrides?: Partial<React.ComponentProps<typeof ElementRail>>) {
  return {
    addItemActions: createAddItemActions(),
    getCenter: () => ({ x: 240, y: 120 }),
    isVisible: true,
    isInteractive: true,
    ...overrides,
  };
}

describe('ElementRail', () => {
  it('renders groups and direct-use icons', () => {
    render(<ElementRail {...createProps()} />);

    expect(screen.getByTestId('element-rail')).toBeTruthy();
    expect(screen.getByTestId('element-rail-group-shapes')).toBeTruthy();
    expect(screen.getByTestId('element-rail-group-diagrams')).toBeTruthy();
    expect(screen.getByTestId('element-rail-group-wireframes')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Text' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Note' })).toBeTruthy();
  });

  it('opens the shapes flyout with seven shape tiles', () => {
    render(<ElementRail {...createProps()} />);

    fireEvent.click(screen.getByTestId('element-rail-group-shapes'));

    const flyout = screen.getByTestId('element-rail-flyout-shapes');
    expect(flyout).toBeTruthy();
    expect(
      screen.getAllByRole('button', {
        name: /Rectangle|Rounded|Capsule|Diamond|Hexagon|Database|Circle/,
      })
    ).toHaveLength(7);
  });

  it('writes palette MIME data when dragging a direct-use icon', () => {
    render(<ElementRail {...createProps()} />);

    const store = new Map<string, string>();
    const dataTransfer = {
      effectAllowed: 'none',
      setData(type: string, value: string) {
        store.set(type, value);
      },
      getData(type: string) {
        return store.get(type) ?? '';
      },
      setDragImage: vi.fn(),
    } as unknown as DataTransfer;

    fireEvent.dragStart(screen.getByRole('button', { name: 'Text' }), { dataTransfer });

    expect(store.get(WEFT_ADD_ITEM_MIME)).toBe('text');
  });

  it('does not render when playback mode hides the rail', () => {
    render(<ElementRail {...createProps({ isVisible: false })} />);

    expect(screen.queryByTestId('element-rail')).toBeNull();
  });
});
