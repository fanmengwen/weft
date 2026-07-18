import { describe, expect, it } from 'vitest';
import type { PersistedDocument } from './persistenceTypes';
import {
  mergeActiveDocumentsWithSoftDelete,
  removePersistedDocument,
  restorePersistedDocument,
  selectTrashedDocuments,
} from './documentSoftDelete';

function createDoc(
  id: string,
  overrides: Partial<PersistedDocument> = {}
): PersistedDocument {
  return {
    id,
    name: id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    content: { nodes: [], edges: [] },
    ...overrides,
  };
}

describe('documentSoftDelete', () => {
  it('soft-deletes active documents missing from the next save set', () => {
    const existing = [createDoc('a'), createDoc('b', { name: 'Keep me' })];
    const active = [createDoc('a', { name: 'A updated' })];
    const now = '2026-07-16T12:00:00.000Z';

    const merged = mergeActiveDocumentsWithSoftDelete(existing, active, now);

    expect(merged).toHaveLength(2);
    expect(merged.find((doc) => doc.id === 'a')).toMatchObject({
      name: 'A updated',
      deletedAt: null,
    });
    expect(merged.find((doc) => doc.id === 'b')).toMatchObject({
      name: 'Keep me',
      deletedAt: now,
      content: { nodes: [], edges: [] },
    });
  });

  it('does not rewrite already soft-deleted documents on later saves', () => {
    const existing = [
      createDoc('a'),
      createDoc('b', { deletedAt: '2026-07-01T00:00:00.000Z', name: 'Old trash' }),
    ];
    const active = [createDoc('a')];
    const now = '2026-07-16T12:00:00.000Z';

    const merged = mergeActiveDocumentsWithSoftDelete(existing, active, now);
    const trashed = merged.find((doc) => doc.id === 'b');

    expect(trashed?.deletedAt).toBe('2026-07-01T00:00:00.000Z');
    expect(trashed?.name).toBe('Old trash');
  });

  it('lists trashed documents newest first', () => {
    const docs = [
      createDoc('a', { deletedAt: '2026-07-01T00:00:00.000Z' }),
      createDoc('b', { deletedAt: null }),
      createDoc('c', { deletedAt: '2026-07-10T00:00:00.000Z' }),
    ];

    expect(selectTrashedDocuments(docs).map((doc) => doc.id)).toEqual(['c', 'a']);
  });

  it('restores a soft-deleted document', () => {
    const docs = [
      createDoc('a'),
      createDoc('b', { deletedAt: '2026-07-10T00:00:00.000Z', name: 'Restored name' }),
    ];

    const { documents, restored } = restorePersistedDocument(docs, 'b');

    expect(restored).toMatchObject({ id: 'b', deletedAt: null, name: 'Restored name' });
    expect(documents.find((doc) => doc.id === 'b')?.deletedAt).toBeNull();
  });

  it('returns null when restore target is missing or already active', () => {
    const docs = [createDoc('a')];
    expect(restorePersistedDocument(docs, 'missing').restored).toBeNull();
    expect(restorePersistedDocument(docs, 'a').restored).toBeNull();
  });

  it('purges a document from the collection', () => {
    const docs = [createDoc('a'), createDoc('b')];
    expect(removePersistedDocument(docs, 'a').map((doc) => doc.id)).toEqual(['b']);
  });
});
