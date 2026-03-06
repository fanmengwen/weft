export const FLOW_PERSISTENCE_DB_NAME = 'openflowkit-persistence';
export const FLOW_PERSISTENCE_DB_VERSION = 1;
export const FLOW_DOCUMENT_STORE_NAME = 'flowDocuments';
export const FLOW_METADATA_STORE_NAME = 'flowMetadata';

function ensureObjectStore(database: IDBDatabase, storeName: string): void {
  if (!database.objectStoreNames.contains(storeName)) {
    database.createObjectStore(storeName, { keyPath: 'id' });
  }
}

export function openFlowPersistenceDatabase(indexedDbFactory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDbFactory.open(FLOW_PERSISTENCE_DB_NAME, FLOW_PERSISTENCE_DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB persistence database.'));
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      ensureObjectStore(database, FLOW_DOCUMENT_STORE_NAME);
      ensureObjectStore(database, FLOW_METADATA_STORE_NAME);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function ensureFlowPersistenceSchema(indexedDbFactory: IDBFactory): Promise<void> {
  const database = await openFlowPersistenceDatabase(indexedDbFactory);
  database.close();
}
