import { describe, expect, it } from 'vitest';
import {
  WEFT_ADD_ITEM_MIME,
  getAddItemDragData,
  setAddItemDragData,
} from './elementPaletteDnD';

export function createDataTransfer(): DataTransfer {
  const store = new Map<string, string>();

  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    setData(type: string, value: string) {
      store.set(type, value);
    },
    getData(type: string) {
      return store.get(type) ?? '';
    },
  } as DataTransfer;
}

describe('elementPaletteDnD', () => {
  it('exports the custom MIME type constant', () => {
    expect(WEFT_ADD_ITEM_MIME).toBe('application/weft-add-item');
  });

  it('round-trips a known add item id', () => {
    const dataTransfer = createDataTransfer();

    setAddItemDragData(dataTransfer, 'process');

    expect(dataTransfer.getData(WEFT_ADD_ITEM_MIME)).toBe('process');
    expect(dataTransfer.getData('text/plain')).toBe('process');
    expect(dataTransfer.effectAllowed).toBe('copy');
    expect(getAddItemDragData(dataTransfer)).toBe('process');
  });

  it('returns null for unknown or empty payloads', () => {
    const dataTransfer = createDataTransfer();

    expect(getAddItemDragData(dataTransfer)).toBeNull();

    dataTransfer.setData(WEFT_ADD_ITEM_MIME, 'not-a-real-item');
    expect(getAddItemDragData(dataTransfer)).toBeNull();
  });
});
