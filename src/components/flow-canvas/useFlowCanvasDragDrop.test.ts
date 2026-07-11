import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFlowCanvasDragDrop } from './useFlowCanvasDragDrop';
import { WEFT_ADD_ITEM_MIME } from '@/components/element-palette/elementPaletteDnD';

const executeAddItem = vi.fn();

vi.mock('@/components/add-items/addItemRegistry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/add-items/addItemRegistry')>();
  return {
    ...actual,
    executeAddItem: (...args: unknown[]) => executeAddItem(...args),
  };
});

function createDataTransfer(options?: {
  mime?: string;
  file?: File;
}): DataTransfer {
  const store = new Map<string, string>();
  const files = options?.file ? [options.file] : [];

  if (options?.mime) {
    store.set(WEFT_ADD_ITEM_MIME, options.mime);
  }

  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    files,
    setData(type: string, value: string) {
      store.set(type, value);
    },
    getData(type: string) {
      return store.get(type) ?? '';
    },
  } as unknown as DataTransfer;
}

function createDragEvent(dataTransfer: DataTransfer): React.DragEvent {
  return {
    preventDefault: vi.fn(),
    dataTransfer,
    clientX: 120,
    clientY: 80,
  } as unknown as React.DragEvent;
}

function createAddItemActions() {
  return {
    onAddShape: vi.fn(),
    onAddAnnotation: vi.fn(),
    onAddSection: vi.fn(),
  };
}

describe('useFlowCanvasDragDrop', () => {
  it('creates add items from palette MIME drops before file handling', () => {
    executeAddItem.mockClear();
    const addItemActions = createAddItemActions();
    const screenToFlowPosition = vi.fn(() => ({ x: 40, y: 60 }));
    const dataTransfer = createDataTransfer({ mime: 'process' });
    const event = createDragEvent(dataTransfer);

    const { result } = renderHook(() =>
      useFlowCanvasDragDrop({
        screenToFlowPosition,
        addItemActions,
      })
    );

    act(() => {
      result.current.onDrop(event);
    });

    expect(executeAddItem).toHaveBeenCalledWith('process', addItemActions, { x: 40, y: 60 });
  });

  it('ignores image file drops', () => {
    executeAddItem.mockClear();
    const addItemActions = createAddItemActions();
    const screenToFlowPosition = vi.fn(() => ({ x: 10, y: 20 }));
    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });
    const dataTransfer = createDataTransfer({ file });
    const event = createDragEvent(dataTransfer);

    const { result } = renderHook(() =>
      useFlowCanvasDragDrop({
        screenToFlowPosition,
        addItemActions,
      })
    );

    act(() => {
      result.current.onDrop(event);
    });

    expect(executeAddItem).not.toHaveBeenCalled();
  });

  it('ignores drops with no palette MIME and no files', () => {
    executeAddItem.mockClear();
    const addItemActions = createAddItemActions();
    const event = createDragEvent(createDataTransfer());

    const { result } = renderHook(() =>
      useFlowCanvasDragDrop({
        screenToFlowPosition: () => ({ x: 0, y: 0 }),
        addItemActions,
      })
    );

    act(() => {
      result.current.onDrop(event);
    });

    expect(executeAddItem).not.toHaveBeenCalled();
  });
});
