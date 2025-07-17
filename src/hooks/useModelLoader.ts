import { useState, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { modelStorage } from '../services/modelStorage';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Definir un tipo que incluya tanto Scene como Group
type SceneOrGroup = THREE.Scene | THREE.Group;

// Definir la interfaz para nuestro GLTF procesado
interface ProcessedGLTF extends Omit<GLTF, 'scene'> {
  scene: SceneOrGroup;
}

// Configurar los loaders
const createConfiguredLoader = () => {
  // Create a renderer for KTX2 support detection
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  });

  // Configure KTX2Loader
  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath('/draco/');
  ktx2Loader.detectSupport(renderer);

  // Configure DRACOLoader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  // Configure GLTFLoader
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setKTX2Loader(ktx2Loader);

  // Clean up renderer
  renderer.dispose();

  return gltfLoader;
};

// Mantener un registro de las descargas en curso
const activeDownloads = new Map<string, Promise<ArrayBuffer>>();

export const useModelLoader = (url: string) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [processedGltf, setProcessedGltf] = useState<ProcessedGLTF | null>(null);
  const downloadPromiseRef = useRef<Promise<ArrayBuffer> | null>(null);

  // Función para obtener o iniciar una descarga
  const getOrStartDownload = async (url: string): Promise<ArrayBuffer> => {
    // Verificar si ya hay una descarga en curso
    let downloadPromise = activeDownloads.get(url);
    
    if (!downloadPromise) {
      // Si no hay descarga en curso, iniciar una nueva
      downloadPromise = modelStorage.downloadModel(url, (progress) => {
        setLoadingProgress(progress);
      });
      activeDownloads.set(url, downloadPromise);
      
      // Limpiar la referencia cuando se complete
      downloadPromise.finally(() => {
        activeDownloads.delete(url);
      });
    }
    
    return downloadPromise;
  };

  // Función para procesar materiales de una escena o grupo
  const processMaterials = (object: SceneOrGroup): void => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // Asegurarse de que los materiales estén actualizados
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.needsUpdate = true;
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.needsUpdate = true;
          }
        }
      }
    });
  };

  // Efecto para cargar el modelo
  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      try {
        // Obtener o iniciar la descarga
        const modelData = await getOrStartDownload(url);
        
        if (!isMounted) return;

        // Parsear el modelo con GLTFLoader
        const loader = createConfiguredLoader();
        
        // Usar una promesa para manejar el parse de manera más limpia
        await new Promise<void>((resolve, reject) => {
          loader.parse(modelData, '', 
            // onLoad callback
            (gltf: GLTF) => {
              if (!isMounted || !gltf || !gltf.scene) {
                resolve();
                return;
              }

              try {
                console.log(`Procesando modelo en Three.js: ${url}`);
                
                // Clonar la escena para evitar problemas de referencia
                const clonedScene = gltf.scene.clone();
                
                // Procesar materiales
                processMaterials(clonedScene);

                // Asegurarnos de que el objeto cumpla con la interfaz ProcessedGLTF
                const processedGltf: ProcessedGLTF = {
                  ...gltf,
                  scene: clonedScene,
                  animations: gltf.animations || [],
                  cameras: gltf.cameras || [],
                  asset: gltf.asset || {},
                  parser: gltf.parser,
                  userData: gltf.userData || {}
                };

                setProcessedGltf(processedGltf);
                console.log(`Modelo procesado exitosamente en Three.js: ${url}`);
                setIsLoaded(true);
                resolve();
              } catch (error) {
                console.error(`Error al procesar modelo ${url}:`, error);
                setError(error instanceof Error ? error.message : 'Error al procesar modelo');
                reject(error);
              }
            },
            // onError callback
            (event: ErrorEvent) => {
              if (!isMounted) {
                resolve();
                return;
              }
              console.error(`Error al parsear modelo ${url}:`, event);
              setError(event.message || 'Error desconocido al parsear el modelo');
              reject(new Error(event.message));
            }
          );
        });

      } catch (error) {
        if (!isMounted) return;
        console.error(`Error al cargar modelo ${url}:`, error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      }
    };

    loadModel();
    
    return () => {
      isMounted = false;
    };
  }, [url]);

  return {
    gltf: processedGltf,
    loadingProgress,
    error,
    isLoaded
  };
}; 
