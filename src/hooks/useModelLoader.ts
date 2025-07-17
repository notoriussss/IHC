import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { modelStorage } from '../services/modelStorage';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Definir el tipo para el resultado de useGLTF
type GLTFResult = {
  nodes: { [key: string]: THREE.Mesh };
  materials: { [key: string]: THREE.Material };
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  cameras: THREE.Camera[];
  asset: { [key: string]: any };
};

export const useModelLoader = (url: string) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Usar useGLTF para cargar el modelo
  const gltf = useGLTF(url) as unknown as GLTFResult;

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Verificar si el modelo ya está en caché
        const cachedModel = await modelStorage.getModel(url);
        
        if (!cachedModel) {
          // Si no está en caché, descargarlo
          await modelStorage.downloadModel(url, (progress) => {
            setLoadingProgress(progress);
          });
        } else {
          setLoadingProgress(100);
        }

        setIsLoaded(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`Error al cargar modelo ${url}:`, err);
        setError(errorMessage);
      }
    };

    loadModel();
  }, [url]);

  // Procesar materiales cuando el modelo está cargado
  useEffect(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
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
    }
  }, [gltf]);

  return {
    gltf,
    loadingProgress,
    error,
    isLoaded
  };
}; 
