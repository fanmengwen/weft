import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AddItemId, AddShapeSpec } from '@/components/add-items/addItemRegistry';
import { WEFT_ADD_ITEM_MIME } from './elementPaletteDnD';
import { createDataTransfer } from './elementPaletteDnD.test';
import { ElementPalette } from './ElementPalette';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

function createProps() {
  return {
    addItemActions: {
      onAddShape: vi.fn(),
      onAddAnnotation: vi.fn(),
      onAddSection: vi.fn(),
    },
    getCenter: () => ({ x: 180, y: 90 }),
    onOpenAssets: vi.fn(),
  };
}

const ITEM_LABELS: Record<AddItemId, string> = {
  start: 'Start',
  end: 'End',
  process: 'Process',
  decision: 'Decision',
  io: 'Input / Output',
  database: 'Database',
  annotation: 'Note',
};

describe('ElementPalette', () => {
  it('renders the title, seven palette items, asset library entry, and drag hint', () => {
    render(<ElementPalette {...createProps()} />);

    expect(screen.getByText('elementPalette.title')).toBeTruthy();
    expect(screen.getByText('elementPalette.assetLibrary')).toBeTruthy();
    expect(screen.getByText('elementPalette.dragHint')).toBeTruthy();

    Object.values(ITEM_LABELS).forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it.each<[AddItemId, string, AddShapeSpec | null]>([
    ['start', 'Start', { type: 'start', shape: 'capsule' }],
    ['end', 'End', { type: 'end', shape: 'capsule' }],
    ['process', 'Process', { type: 'process', shape: 'rounded' }],
    ['decision', 'Decision', { type: 'decision', shape: 'diamond' }],
    ['io', 'Input / Output', { type: 'custom', shape: 'parallelogram' }],
    ['database', 'Database', { type: 'custom', shape: 'cylinder' }],
    ['annotation', 'Note', null],
  ])('clicking %s triggers the matching add action at canvas center', (itemId, label, spec) => {
    const props = createProps();

    render(<ElementPalette {...props} />);
    fireEvent.click(screen.getByTestId(`element-palette-item-${itemId}`));

    if (spec) {
      expect(props.addItemActions.onAddShape).toHaveBeenCalledWith(spec, { x: 180, y: 90 });
      expect(props.addItemActions.onAddAnnotation).not.toHaveBeenCalled();
      return;
    }

    expect(props.addItemActions.onAddAnnotation).toHaveBeenCalledWith({ x: 180, y: 90 });
    expect(props.addItemActions.onAddShape).not.toHaveBeenCalled();
  });

  it.each<AddItemId>([
    'start',
    'end',
    'process',
    'decision',
    'io',
    'database',
    'annotation',
  ])('sets add-item drag data for %s on dragstart', (itemId) => {
    render(<ElementPalette {...createProps()} />);

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(screen.getByTestId(`element-palette-item-${itemId}`), { dataTransfer });

    expect(dataTransfer.getData(WEFT_ADD_ITEM_MIME)).toBe(itemId);
    expect(dataTransfer.getData('text/plain')).toBe(itemId);
    expect(dataTransfer.effectAllowed).toBe('copy');
  });

  it('opens the asset library when the entry row is clicked', () => {
    const props = createProps();

    render(<ElementPalette {...props} />);
    fireEvent.click(screen.getByTestId('element-palette-asset-library'));

    expect(props.onOpenAssets).toHaveBeenCalledTimes(1);
  });
});
