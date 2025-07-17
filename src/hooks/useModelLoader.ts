import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { modelStorage } from '../services/modelStorage';
import * as THREE from 'three';
import { createConfiguredLoader } from '../utils/loaderConfig';

// Configure useGLTF to use our configured loader and cached data
useGLTF.preload = (path: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Intentar obtener el modelo de la caché
      const cachedModel = await modelStorage.getModel(path);
      if (cachedModel) {
        // Si está en caché, usar el loader configurado para cargarlo desde el ArrayBuffer
        const loader = createConfiguredLoader();
        loader.parse(cachedModel, '', resolve, reject);
      } else {
        // Si no está en caché, usar el loader configurado para descargarlo
        const loader = createConfiguredLoader();
        loader.load(path, resolve, undefined, reject);
      }
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

  // Precargar el modelo usando modelStorage si no está en caché
  useEffect(() => {
    const preloadModel = async () => {
      try {
        // Verificar si el modelo ya está en caché
        const cachedModel = await modelStorage.getModel(url);
        if (!cachedModel) {
          console.log(`Iniciando descarga del modelo: ${url}`);
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          await modelStorage.saveModel(url, arrayBuffer);
          console.log(`Modelo ${url} guardado en caché`);
        } else {
          console.log(`Modelo ${url} encontrado en caché`);
        }
        setLoadingProgress(100);
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
