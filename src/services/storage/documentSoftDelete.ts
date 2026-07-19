import type { PersistedDocument } from './persistenceTypes';

/**
 * Merge the next active document set with existing storage records.
 * Documents missing from the active set are soft-deleted (deletedAt set)
 * instead of removed, preserving content for Trash restore.
 */
export function mergeActiveDocumentsWithSoftDelete(
  existingDocuments: PersistedDocument[],
  activeDocuments: PersistedDocument[],
  nowIso: string
): PersistedDocument[] {
  const nextIds = new Set(activeDocuments.map((document) => document.id));
  const existingById = new Map(
    existingDocuments.map((document) => [document.id, document] as const)
  );

  const nextActive = activeDocuments.map((document) => {
    const existing = existingById.get(document.id);
    return {
      ...document,
      createdAt: existing?.createdAt ?? document.createdAt ?? nowIso,
      updatedAt: document.updatedAt ?? nowIso,
      deletedAt: null,
    } satisfies PersistedDocument;
  });

  const retainedOrSoftDeleted = existingDocuments
    .filter((document) => !nextIds.has(document.id))
    .map((document) => {
      if (document.deletedAt != null) {
        return document;
      }
      return {
        ...document,
        deletedAt: nowIso,
        updatedAt: nowIso,
      } satisfies PersistedDocument;
    });

  return [...nextActive, ...retainedOrSoftDeleted];
}

export function selectTrashedDocuments(
  documents: PersistedDocument[]
): PersistedDocument[] {
  return documents
    .filter((document) => document.deletedAt != null)
    .sort((left, right) => {
      const leftAt = left.deletedAt ?? '';
      const rightAt = right.deletedAt ?? '';
      return rightAt.localeCompare(leftAt);
    });
}

export function restorePersistedDocument(
  documents: PersistedDocument[],
  documentId: string
): { documents: PersistedDocument[]; restored: PersistedDocument | null } {
  let restored: PersistedDocument | null = null;
  const nextDocuments = documents.map((document) => {
    if (document.id !== documentId || document.deletedAt == null) {
      return document;
    }
    restored = {
      ...document,
      deletedAt: null,
    };
    return restored;
  });

  return { documents: nextDocuments, restored };
}

export function removePersistedDocument(
  documents: PersistedDocument[],
  documentId: string
): PersistedDocument[] {
  return documents.filter((document) => document.id !== documentId);
}
