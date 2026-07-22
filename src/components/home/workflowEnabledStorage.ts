const STORAGE_KEY = 'weft_workflow_enabled';

function readMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, boolean> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'boolean') {
        result[id] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota / private-mode failures; UI falls back to enabled.
  }
}

export function isWorkflowEnabled(documentId: string): boolean {
  return readMap()[documentId] ?? true;
}

export function setWorkflowEnabled(documentId: string, enabled: boolean): void {
  const map = readMap();
  map[documentId] = enabled;
  writeMap(map);
}

export function removeWorkflowEnabled(documentId: string): void {
  const map = readMap();
  if (!(documentId in map)) {
    return;
  }
  delete map[documentId];
  writeMap(map);
}

export function copyWorkflowEnabled(fromId: string, toId: string): void {
  setWorkflowEnabled(toId, isWorkflowEnabled(fromId));
}
