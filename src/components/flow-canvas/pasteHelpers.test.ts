import { describe, expect, it } from 'vitest';
import {
  createPastedAnnotationFromText,
  isEditablePasteTarget,
  resolveLayoutDirection,
} from './pasteHelpers';

describe('pasteHelpers', () => {
  it('detects editable paste targets', () => {
    const input = document.createElement('input');
    const div = document.createElement('div');

    expect(isEditablePasteTarget(input)).toBe(true);
    expect(isEditablePasteTarget(div)).toBe(false);
    expect(isEditablePasteTarget(null)).toBe(false);
  });

  it('normalizes layout direction with safe fallback', () => {
    expect(resolveLayoutDirection({ direction: 'LR' })).toBe('LR');
    expect(resolveLayoutDirection({ metadata: { direction: 'BT' } })).toBe('BT');
    expect(resolveLayoutDirection({ direction: 'UNKNOWN' })).toBe('TB');
  });

  it('creates a pasted annotation node bound to active layer', () => {
    const node = createPastedAnnotationFromText('hello', { x: 10, y: 20 }, 'default');
    expect(node.type).toBe('annotation');
    expect(node.position).toEqual({ x: 10, y: 20 });
    expect(node.data.label).toBe('hello');
    expect(node.data.subLabel).toBe('');
    expect(node.data.layerId).toBe('default');
  });
});
