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
  public modelInfo: {
    currentModel: string;
    lastUpdated: string;
    totalSize: number;
    models: {
      [key: string]: {
        name: string;
        size: number;
        path: string;
        downloaded?: number;
        total?: number;
      };
    };
  } = {
    currentModel: '',
    lastUpdated: new Date().toISOString(),
    totalSize: 0,
    models: {}
  };

  constructor() {
    this.initPromise = this.init();
    this.loadModelInfo();
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

  private async loadModelInfo() {
    try {
      const response = await fetch('/data/models-info.json');
      const data = await response.json();
      this.modelInfo = {
        ...data,
        totalSize: Object.values(data.models).reduce((acc: number, model: any) => acc + model.size, 0)
      };
    } catch (error) {
      console.error('Error al cargar información de modelos:', error);
    }
  }

  async saveModel(url: string, modelData: ArrayBuffer): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put('models', modelData, url);
      console.log(`Modelo ${url} guardado en caché`);
    } catch (error) {
      console.error(`Error al guardar modelo ${url} en caché:`, error);
      throw error;
    }
  }

  async getModel(url: string): Promise<ArrayBuffer | null> {
    try {
      const db = await this.getDB();
      const model = await db.get('models', url);
      if (model) {
        console.log(`Modelo ${url} recuperado de caché`);
      }
      return model || null;
    } catch (error) {
      console.error(`Error al recuperar modelo ${url} de caché:`, error);
      return null;
    }
  }

  async hasModel(url: string): Promise<boolean> {
    try {
      if (!url) {
        console.warn('URL inválida al verificar modelo en caché');
        return false;
      }

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
      // Verificar si el modelo está en caché
      const cachedModel = await this.getModel(url);
      if (cachedModel) {
        console.log(`Modelo ${url} encontrado en caché`);
        if (onProgress) onProgress(100);
        return cachedModel;
      }

      console.log(`Iniciando descarga de ${url}`);
      // Si no está en caché, descargar el modelo
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get('Content-Length')) || 0;

      if (!reader) {
        throw new Error('No se pudo iniciar la descarga del modelo');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // Calcular y reportar el progreso
        const progress = (receivedLength / contentLength) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      }

      // Guardar el modelo en caché
      const blob = new Blob(chunks);
      const arrayBuffer = await blob.arrayBuffer();
      
      try {
        await this.saveModel(url, arrayBuffer);
        console.log(`Modelo ${url} guardado en caché`);
      } catch (error) {
        console.warn(`No se pudo guardar el modelo ${url} en caché:`, error);
      }

      return arrayBuffer;

    } catch (error) {
      console.error(`Error al descargar el modelo ${url}:`, error);
      // Intentar recuperar de caché como último recurso
      const cachedModel = await this.getModel(url);
      if (cachedModel) {
        console.log(`Recuperando modelo ${url} de caché después de error`);
        if (onProgress) onProgress(100);
        return cachedModel;
      }
      throw error;
    }
  }

  private async updateModelInfo(modelId: string): Promise<void> {
    try {
      this.modelInfo.currentModel = modelId;
      this.modelInfo.lastUpdated = new Date().toISOString();
    } catch (error) {
      console.error('Error al actualizar la información del modelo:', error);
    }
  }

  async updateDownloadProgress(modelId: string, downloaded: number, total: number): Promise<void> {
    try {
      if (!modelId || !this.modelInfo.models[modelId]) {
        return;
      }

      // Convertir bytes a megabytes
      const downloadedMB = downloaded / (1024 * 1024);
      const totalMB = total / (1024 * 1024);
      
      this.modelInfo.models[modelId].downloaded = downloadedMB;
      this.modelInfo.models[modelId].total = totalMB;
    } catch (error) {
      console.error('Error al actualizar el progreso de descarga:', error);
    }
  }

  private getModelIdFromUrl(url: string): string {
    if (!url) {
      return 'default';
    }

    const path = url.split('/').pop()?.replace('.glb', '') || '';
    switch (path) {
      case 'proyecto': return 'default';
      case 'acuario-final': return 'acuario';
      case 'cultura': return 'cultura';
      case 'floraOBJ': return 'invernadero';
      case 'regGuayana': return 'guayana';
      default: return 'default';
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
          const modelData = await this.downloadModel(modelUrl);
          await this.saveModel(modelUrl, modelData);
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