const DB_NAME = 'floraViewerDB';
const DB_VERSION = 1;
const MODEL_STORE = 'models';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MODEL_STORE)) {
        db.createObjectStore(MODEL_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveModel = async (modelId: string, modelData: any): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MODEL_STORE, 'readwrite');
    const store = transaction.objectStore(MODEL_STORE);
    const request = store.put({ id: modelId, data: modelData, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getModel = async (modelId: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MODEL_STORE, 'readonly');
    const store = transaction.objectStore(MODEL_STORE);
    const request = store.get(modelId);

    request.onsuccess = () => resolve(request.result?.data);
    request.onerror = () => reject(request.error);
  });
};

export const deleteModel = async (modelId: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MODEL_STORE, 'readwrite');
    const store = transaction.objectStore(MODEL_STORE);
    const request = store.delete(modelId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearModels = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MODEL_STORE, 'readwrite');
    const store = transaction.objectStore(MODEL_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}; 