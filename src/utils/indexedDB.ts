const DB_NAME = 'floraViewerDB';
const DB_VERSION = 2; // Incrementamos la versión para la actualización
const MODEL_STORE = 'models';
const ICON_STORE = 'icons';

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
      
      // Crear store de modelos si no existe
      if (!db.objectStoreNames.contains(MODEL_STORE)) {
        db.createObjectStore(MODEL_STORE, { keyPath: 'id' });
      }
      
      // Crear store de iconos si no existe
      if (!db.objectStoreNames.contains(ICON_STORE)) {
        db.createObjectStore(ICON_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Funciones existentes para modelos
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

// Nuevas funciones para iconos
export const saveIcon = async (iconId: string, iconData: Blob): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ICON_STORE, 'readwrite');
    const store = transaction.objectStore(ICON_STORE);
    const request = store.put({ id: iconId, data: iconData, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getIcon = async (iconId: string): Promise<Blob | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ICON_STORE, 'readonly');
    const store = transaction.objectStore(ICON_STORE);
    const request = store.get(iconId);

    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
};

export const deleteIcon = async (iconId: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ICON_STORE, 'readwrite');
    const store = transaction.objectStore(ICON_STORE);
    const request = store.delete(iconId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearIcons = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ICON_STORE, 'readwrite');
    const store = transaction.objectStore(ICON_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}; 
