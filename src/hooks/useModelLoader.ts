import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { modelStorage } from '../services/modelStorage';

export const useModelLoader = (url: string) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
      console.log(`Modelo cargado en Three.js: ${url}`);
      setIsLoaded(true);
    }
  }, [gltf, url]);

  return {
    gltf,
    loadingProgress,
    error,
    isLoaded
  };
}; 