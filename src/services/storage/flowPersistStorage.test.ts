import { afterEach, describe, expect, it, vi } from 'vitest';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { createFlowPersistStorage } from './flowPersistStorage';
import { ensureFlowPersistenceSchema } from './indexedDbSchema';

vi.mock('./indexedDbSchema', () => ({
  ensureFlowPersistenceSchema: vi.fn(() => Promise.resolve()),
}));

describe('flowPersistStorage', () => {
  const originalFlag = ROLLOUT_FLAGS.indexedDbStorageV1;
  const originalIndexedDb = globalThis.indexedDB;

  afterEach(() => {
    ROLLOUT_FLAGS.indexedDbStorageV1 = originalFlag;
    vi.mocked(ensureFlowPersistenceSchema).mockClear();
    if (typeof originalIndexedDb === 'undefined') {
      // `delete` is required to restore the undefined global.
      delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;
    } else {
      globalThis.indexedDB = originalIndexedDb;
    }
  });

  it('uses localStorage storage path when indexedDbStorageV1 is disabled', () => {
    ROLLOUT_FLAGS.indexedDbStorageV1 = false;
    globalThis.indexedDB = {} as IDBFactory;

    const storage = createFlowPersistStorage();

    expect(storage.getItem).toBeTypeOf('function');
    expect(storage.setItem).toBeTypeOf('function');
    expect(ensureFlowPersistenceSchema).not.toHaveBeenCalled();
  });

  it('attempts IndexedDB schema init when indexedDbStorageV1 is enabled', () => {
    ROLLOUT_FLAGS.indexedDbStorageV1 = true;
    globalThis.indexedDB = {} as IDBFactory;

    createFlowPersistStorage();

    expect(ensureFlowPersistenceSchema).toHaveBeenCalledWith(globalThis.indexedDB);
  });

  it('does not attempt schema init when IndexedDB is unavailable', () => {
    ROLLOUT_FLAGS.indexedDbStorageV1 = true;
    delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;

    createFlowPersistStorage();

    expect(ensureFlowPersistenceSchema).not.toHaveBeenCalled();
  });
});
