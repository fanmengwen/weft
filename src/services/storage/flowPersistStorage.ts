import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { createJSONStorage, type PersistStorage, type StateStorage } from 'zustand/middleware';
import type { FlowState } from '@/store/types';
import { ensureFlowPersistenceSchema } from './indexedDbSchema';
import { createIndexedDbStateStorage } from './indexedDbStateStorage';
import { reportStorageTelemetry } from './storageTelemetry';

type PersistedFlowStateSlice = Pick<
  FlowState,
  | 'tabs'
  | 'activeTabId'
  | 'designSystems'
  | 'activeDesignSystemId'
  | 'viewSettings'
  | 'globalEdgeOptions'
  | 'aiSettings'
  | 'brandConfig'
  | 'brandKits'
  | 'activeBrandKitId'
  | 'layers'
  | 'activeLayerId'
>;

function getBrowserLocalStorage(): Storage {
  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage is not available in this runtime.');
  }
  return localStorage;
}

function getBrowserIndexedDbFactory(): IDBFactory | null {
  if (typeof indexedDB === 'undefined') return null;
  return indexedDB;
}

function resolveStateStorage(): StateStorage {
  const localStorageRef = typeof localStorage === 'undefined' ? null : localStorage;
  const indexedDbFactory = getBrowserIndexedDbFactory();

  if (!ROLLOUT_FLAGS.indexedDbStorageV1 || !indexedDbFactory) {
    return getBrowserLocalStorage();
  }

  return createIndexedDbStateStorage({
    indexedDbFactory,
    localStorageRef,
  });
}

export function initializeIndexedDbSchemaScaffold(): void {
  if (!ROLLOUT_FLAGS.indexedDbStorageV1) return;
  const indexedDbFactory = getBrowserIndexedDbFactory();
  if (!indexedDbFactory) return;

  void ensureFlowPersistenceSchema(indexedDbFactory).catch(() => {
    reportStorageTelemetry({
      area: 'schema',
      code: 'SCHEMA_INIT_FAILED',
      severity: 'warning',
      message: 'IndexedDB schema initialization failed; runtime will continue with safe fallback paths.',
    });
  });
}

export function createFlowPersistStorage(): PersistStorage<PersistedFlowStateSlice> {
  initializeIndexedDbSchemaScaffold();
  return createJSONStorage<PersistedFlowStateSlice>(resolveStateStorage);
}
