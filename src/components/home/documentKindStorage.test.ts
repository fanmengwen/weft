import { beforeEach, describe, expect, it } from 'vitest';
import {
  copyDocumentKind,
  getDocumentKind,
  removeDocumentKind,
  setDocumentKind,
} from './documentKindStorage';

describe('documentKindStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults missing documents to chart', () => {
    expect(getDocumentKind('missing')).toBe('chart');
  });

  it('persists and returns document kinds', () => {
    setDocumentKind('doc-1', 'workflow');
    expect(getDocumentKind('doc-1')).toBe('workflow');
  });

  it('removes and copies kinds', () => {
    setDocumentKind('a', 'workflow');
    copyDocumentKind('a', 'b');
    expect(getDocumentKind('b')).toBe('workflow');
    removeDocumentKind('a');
    expect(getDocumentKind('a')).toBe('chart');
  });
});
