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
  '/dracoFlora/culturaComprimido.glb',
  '/dracoFlora/floraOBJ.glb',
  '/dracoFlora/regGuayana.glb'
];

class ModelStorage {
  private db: IDBPDatabase<ModelDB> | null = null;
  private readonly DB_NAME = 'flora-viewer-db';
  private readonly STORE_NAME = 'models';
  private readonly VERSION = 1;
  private initPromise: Promise<IDBPDatabase<ModelDB>> | null = null;
  private connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
  private readonly SPEED_THRESHOLDS = {
    slow: 1000000, // 1 Mbps
    medium: 5000000 // 5 Mbps
  };
  private lastSpeedTest: number = 0;
  private readonly SPEED_TEST_INTERVAL = 300000; // 5 minutos
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

  private async measureConnectionSpeed(url: string, fileSize: number): Promise<void> {
    try {
      const startTime = performance.now();
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const endTime = performance.now();
      
      if (!response.ok) {
        throw new Error('Speed test failed');
      }

      const duration = (endTime - startTime) / 1000; // Convertir a segundos
      const speedBps = (fileSize * 8) / duration; // Velocidad en bits por segundo

      // Determinar la velocidad de conexión
      if (speedBps < this.SPEED_THRESHOLDS.slow) {
        this.connectionSpeed = 'slow';
        console.log('Conexión lenta detectada:', (speedBps / 1000000).toFixed(2), 'Mbps');
      } else if (speedBps < this.SPEED_THRESHOLDS.medium) {
        this.connectionSpeed = 'medium';
        console.log('Conexión media detectada:', (speedBps / 1000000).toFixed(2), 'Mbps');
      } else {
        this.connectionSpeed = 'fast';
        console.log('Conexión rápida detectada:', (speedBps / 1000000).toFixed(2), 'Mbps');
      }

      this.lastSpeedTest = Date.now();
    } catch (error) {
      console.warn('No se pudo medir la velocidad de conexión:', error);
      // No cambiamos la velocidad actual si falla la medición
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

      // Obtener el tamaño del archivo antes de descargar
      const headResponse = await fetch(url, { method: 'HEAD' });
      const contentLength = Number(headResponse.headers.get('Content-Length')) || 0;

      // Medir la velocidad solo si han pasado 5 minutos desde la última medición
      if (Date.now() - this.lastSpeedTest > this.SPEED_TEST_INTERVAL) {
        await this.measureConnectionSpeed(url, contentLength);
      }

      console.log(`Iniciando descarga de ${url} con velocidad de conexión: ${this.connectionSpeed}`);
      
      // Ajustar la estrategia de descarga según la velocidad
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
      if (!reader) {
        throw new Error('No se pudo iniciar la descarga del modelo');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];
      let lastProgressUpdate = 0;
      let downloadStartTime = performance.now();
      let lastSpeedUpdate = downloadStartTime;
      let lastBytesReceived = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // Calcular velocidad actual cada 2 segundos
        const now = performance.now();
        if (now - lastSpeedUpdate > 2000) {
          const timeElapsed = (now - lastSpeedUpdate) / 1000;
          const bytesReceived = receivedLength - lastBytesReceived;
          const currentSpeed = (bytesReceived * 8) / timeElapsed; // bits por segundo
          
          // Actualizar la velocidad de conexión si cambia significativamente
          if (currentSpeed < this.SPEED_THRESHOLDS.slow && this.connectionSpeed !== 'slow') {
            this.connectionSpeed = 'slow';
            console.log('Conexión degradada a lenta:', (currentSpeed / 1000000).toFixed(2), 'Mbps');
          } else if (currentSpeed > this.SPEED_THRESHOLDS.medium && this.connectionSpeed !== 'fast') {
            this.connectionSpeed = 'fast';
            console.log('Conexión mejorada a rápida:', (currentSpeed / 1000000).toFixed(2), 'Mbps');
          }

          lastSpeedUpdate = now;
          lastBytesReceived = receivedLength;
        }

        // Calcular y reportar el progreso
        const progress = (receivedLength / contentLength) * 100;
        
        // Ajustar la frecuencia de actualización del progreso según la velocidad
        if (onProgress && (now - lastProgressUpdate > this.getProgressUpdateInterval())) {
          onProgress(progress);
          lastProgressUpdate = now;
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

  private getProgressUpdateInterval(): number {
    // Ajustar la frecuencia de actualización según la velocidad
    switch (this.connectionSpeed) {
      case 'slow':
        return 2000; // Actualizar cada 2 segundos en conexiones lentas
      case 'medium':
        return 1000; // Actualizar cada segundo en conexiones medias
      case 'fast':
        return 500; // Actualizar cada medio segundo en conexiones rápidas
      default:
        return 1000;
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