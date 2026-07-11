import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import {
  executeAddItem,
  getAddItemDefinitions,
  type AddItemId,
  type AddShapeSpec,
} from './addItemRegistry';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

function getTestT() {
  const { result } = renderHook(() => useTranslation());
  return result.current.t;
}

function createActions() {
  return {
    onAddShape: vi.fn(),
    onAddAnnotation: vi.fn(),
    onAddSection: vi.fn(),
  };
}

describe('addItemRegistry', () => {
  it('exposes seven semantic toolbar entries', () => {
    const ids = getAddItemDefinitions(getTestT()).map((item) => item.id);

    expect(ids).toEqual([
      'start',
      'end',
      'process',
      'decision',
      'io',
      'database',
      'annotation',
    ]);
  });

  it.each<[AddItemId, AddShapeSpec]>([
    ['start', { type: 'start', shape: 'capsule' }],
    ['end', { type: 'end', shape: 'capsule' }],
    ['process', { type: 'process', shape: 'rounded' }],
    ['decision', { type: 'decision', shape: 'diamond' }],
    ['io', { type: 'custom', shape: 'parallelogram' }],
    ['database', { type: 'custom', shape: 'cylinder' }],
  ])('dispatches %s to onAddShape with the expected node spec', (id, spec) => {
    const actions = createActions();

    executeAddItem(id, actions, { x: 10, y: 20 });

    expect(actions.onAddShape).toHaveBeenCalledWith(spec, { x: 10, y: 20 });
    expect(actions.onAddAnnotation).not.toHaveBeenCalled();
  });

  it('routes annotation through onAddAnnotation', () => {
    const actions = createActions();

    executeAddItem('annotation', actions, { x: 1, y: 2 });

    expect(actions.onAddAnnotation).toHaveBeenCalledWith({ x: 1, y: 2 });
    expect(actions.onAddShape).not.toHaveBeenCalled();
  });
});
