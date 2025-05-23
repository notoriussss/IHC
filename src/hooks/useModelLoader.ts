import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { modelStorage } from '../services/modelStorage';
import * as THREE from 'three';

export const useModelLoader = (url: string) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [processedGltf, setProcessedGltf] = useState<any>(null);

  // Precargar el modelo usando modelStorage
  useEffect(() => {
    const preloadModel = async () => {
      try {
        console.log(`Iniciando precarga del modelo: ${url}`);
        await modelStorage.downloadModel(url, (progress) => {
          setLoadingProgress(progress);
          console.log(`Progreso de descarga de ${url}: ${progress.toFixed(2)}%`);
        });
        console.log(`Modelo precargado exitosamente: ${url}`);
      } catch (error) {
        console.error(`Error al precargar modelo ${url}:`, error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      }
    };

    preloadModel();
  }, [url]);

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

  return {
    gltf: processedGltf || gltf,
    loadingProgress,
    error,
    isLoaded
  };
}; 