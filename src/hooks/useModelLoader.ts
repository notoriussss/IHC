import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { modelStorage } from '../services/modelStorage';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

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

// Configure useGLTF to use our configured loader and cached data
useGLTF.preload = (path: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Usar modelStorage para obtener o descargar el modelo
      const modelData = await modelStorage.downloadModel(path);
      const loader = createConfiguredLoader();
      loader.parse(modelData, '', resolve, reject);
    } catch (error) {
      console.error('Error loading model:', error);
      reject(error);
    }
  });
};

export const useModelLoader = (url: string) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [processedGltf, setProcessedGltf] = useState<any>(null);

  // Cargar el modelo usando useGLTF
  const gltf = useGLTF(url);

  useEffect(() => {
    if (gltf) {
      try {
        console.log(`Procesando modelo en Three.js: ${url}`);
        
        // Clonar la escena para evitar problemas de referencia
        const clonedScene = gltf.scene.clone();
        
        // Procesar materiales
        clonedScene.traverse((child) => {
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

        setProcessedGltf({ ...gltf, scene: clonedScene });
        console.log(`Modelo procesado exitosamente en Three.js: ${url}`);
        setIsLoaded(true);
      } catch (error) {
        console.error(`Error al procesar modelo ${url}:`, error);
        setError(error instanceof Error ? error.message : 'Error al procesar modelo');
      }
    }
  }, [gltf, url]);

  // Precargar el modelo usando modelStorage
  useEffect(() => {
    const preloadModel = async () => {
      try {
        await modelStorage.downloadModel(url, (progress) => {
          setLoadingProgress(progress);
        });
      } catch (error) {
        console.error(`Error al precargar modelo ${url}:`, error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      }
    };

    preloadModel();
  }, [url]);

  return {
    gltf: processedGltf || gltf,
    loadingProgress,
    error,
    isLoaded
  };
}; 
