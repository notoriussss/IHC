import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ModelDB extends DBSchema {
  models: {
    key: string;
    value: ArrayBuffer;
  };
}

// Lista de modelos disponibles
export const AVAILABLE_MODELS = [
  '/dracoFlora/proyecto.glb',
  '/dracoFlora/acuario-final.glb',
  '/dracoFlora/cultura.glb',
  '/dracoFlora/floraOBJ.glb',
  '/dracoFlora/regGuayana.glb'
];

class ModelStorage {
  private db: IDBPDatabase<ModelDB> | null = null;
  private readonly DB_NAME = 'flora-viewer-db';
  private readonly STORE_NAME = 'models';
  private readonly VERSION = 1;
  private initPromise: Promise<IDBPDatabase<ModelDB>> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<IDBPDatabase<ModelDB>> {
    if (!this.db) {
      this.db = await openDB<ModelDB>(this.DB_NAME, this.VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('models')) {
            db.createObjectStore('models');
          }
        },
      });
    }
    return this.db;
  }

  private async getDB(): Promise<IDBPDatabase<ModelDB>> {
    if (!this.db) {
      this.db = await this.initPromise;
      if (!this.db) {
        throw new Error('Failed to initialize database');
      }
    }
    return this.db;
  }

  async saveModel(url: string, modelData: ArrayBuffer): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put('models', modelData, url);
      console.log('Modelo guardado en caché:', url);
    } catch (error) {
      console.error('Error al guardar modelo en caché:', url, error);
    }
  }

  async getModel(url: string): Promise<ArrayBuffer | null> {
    try {
      const db = await this.getDB();
      const model = await db.get('models', url);
      if (model) {
        console.log('Modelo recuperado de caché:', url);
      }
      return model || null;
    } catch (error) {
      console.error('Error al recuperar modelo de caché:', url, error);
      return null;
    }
  }

  async hasModel(url: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const model = await db.get('models', url);
      return model !== undefined;
    } catch (error) {
      console.error('Error al verificar modelo en caché:', url, error);
      return false;
    }
  }

  async listCachedModels(): Promise<string[]> {
    try {
      const db = await this.getDB();
      return await db.getAllKeys('models');
    } catch (error) {
      console.error('Error al listar modelos en caché:', error);
      return [];
    }
  }

  async downloadModel(url: string, onProgress?: (progress: number) => void): Promise<ArrayBuffer> {
    try {
      // Primero intentamos obtener el modelo del IndexedDB
      const cachedModel = await this.getModel(url);
      if (cachedModel) {
        console.log('Modelo encontrado en caché:', url);
        return cachedModel;
      }

      // Si no está en caché, lo descargamos
      console.log('Descargando modelo:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al descargar modelo: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (onProgress && total) {
          onProgress((loaded / total) * 100);
        }
      }

      const modelData = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        modelData.set(chunk, position);
        position += chunk.length;
      }

      // Guardamos el modelo en IndexedDB
      await this.saveModel(url, modelData.buffer);
      console.log('Modelo descargado y guardado en caché:', url);

      return modelData.buffer;
    } catch (error) {
      console.error('Error en downloadModel:', url, error);
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const db = await this.getDB();
      await db.clear('models');
      console.log('Caché de modelos limpiada');
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }

  async preloadAllModels(onProgress?: (progress: number) => void): Promise<void> {
    console.log('Iniciando precarga de todos los modelos...');
    const totalModels = AVAILABLE_MODELS.length;
    let loadedModels = 0;

    for (const modelUrl of AVAILABLE_MODELS) {
      try {
        const exists = await this.hasModel(modelUrl);
        if (!exists) {
          console.log('Precargando modelo:', modelUrl);
          const data = await this.downloadModel(modelUrl);
          await this.saveModel(modelUrl, data);
        }
        loadedModels++;
        if (onProgress) {
          onProgress((loadedModels / totalModels) * 100);
        }
      } catch (error) {
        console.error('Error al precargar modelo:', modelUrl, error);
      }
    }
    console.log('Precarga de modelos completada');
  }
}

export const modelStorage = new ModelStorage(); 