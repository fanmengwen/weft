import { describe, expect, it } from 'vitest';
import {
  WEFT_ADD_ITEM_MIME,
  getAddItemDragData,
  setAddItemDragData,
} from './elementPaletteDnD';
import { createDataTransfer } from './dataTransferTestUtils';

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
