import { describe, expect, it, vi } from 'vitest';
import { executeAddItem, getAddItemDefinitions } from './addItemRegistry';

const identityT = ((key: string, fallback?: string) => fallback ?? key) as Parameters<
  typeof getAddItemDefinitions
>[0];

function createActions() {
  return {
    onAddShape: vi.fn(),
    onAddAnnotation: vi.fn(),
    onAddSection: vi.fn(),
    onAddArchitectureNode: vi.fn(),
  };
}

describe('addItemRegistry', () => {
  it('exposes seven semantic toolbar entries', () => {
    const ids = getAddItemDefinitions(identityT).map((item) => item.id);

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

  it('creates a start node via onAddShape', () => {
    const actions = createActions();

    executeAddItem('start', actions, { x: 10, y: 20 });

    expect(actions.onAddShape).toHaveBeenCalledWith(
      { type: 'start', shape: 'capsule' },
      { x: 10, y: 20 },
    );
    expect(actions.onAddAnnotation).not.toHaveBeenCalled();
  });

  it('creates an io node as custom with parallelogram shape', () => {
    const actions = createActions();

    executeAddItem('io', actions);

    expect(actions.onAddShape).toHaveBeenCalledWith(
      { type: 'custom', shape: 'parallelogram' },
      undefined,
    );
  });

  it('routes annotation through onAddAnnotation', () => {
    const actions = createActions();

    executeAddItem('annotation', actions, { x: 1, y: 2 });

    expect(actions.onAddAnnotation).toHaveBeenCalledWith({ x: 1, y: 2 });
    expect(actions.onAddShape).not.toHaveBeenCalled();
  });
});
