export type DocumentKind = 'chart' | 'workflow';

const STORAGE_KEY = 'weft_document_kinds';

function readMap(): Record<string, DocumentKind> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, DocumentKind> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value === 'chart' || value === 'workflow') {
        result[id] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, DocumentKind>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota / private-mode failures; UI falls back to chart.
  }
}

export function getDocumentKind(documentId: string): DocumentKind {
  return readMap()[documentId] ?? 'chart';
}

export function setDocumentKind(documentId: string, kind: DocumentKind): void {
  const map = readMap();
  map[documentId] = kind;
  writeMap(map);
}

export function removeDocumentKind(documentId: string): void {
  const map = readMap();
  if (!(documentId in map)) {
    return;
  }
  delete map[documentId];
  writeMap(map);
}

export function copyDocumentKind(fromId: string, toId: string): void {
  setDocumentKind(toId, getDocumentKind(fromId));
}
