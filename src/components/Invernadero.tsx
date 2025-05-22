import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import PlantCarousel from './PlantCarousel';
import { motion } from 'framer-motion';
import { TypingText } from './TypingText';
import { modelStorage } from '../services/modelStorage';

interface CircularButtonProps {
  position: [number, number, number];
  onClick: () => void;
  label: string;
}

function CircularButton({ position, onClick, label }: CircularButtonProps) {
  return (
    <Html position={position} center>
      <div
        className="pulsing-button"
        onClick={onClick}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '1px solid white',
          background: 'rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          position: 'relative',
          display: 'block',
          animation: 'pulse 1.5s infinite',
          zIndex: 1000
        }}
      />
    </Html>
  );
}

interface InvernaderoProps {
  onViewChange: (view: string) => void;
  showMap?: boolean;
}

const Invernadero = forwardRef<THREE.Group, InvernaderoProps>(({ onViewChange, showMap = false }, ref) => {
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [hasReachedTarget, setHasReachedTarget] = useState(false);
  const [isCarouselReady, setIsCarouselReady] = useState(false);
  const [isInitialMovementComplete, setIsInitialMovementComplete] = useState(false);

  // Precargar el modelo
  useEffect(() => {
    const preloadModel = async () => {
      try {
        console.log('Iniciando precarga del modelo floraOBJ.glb...');
        const hasCachedModel = await modelStorage.hasModel('/dracoFlora/floraOBJ.glb');
        console.log('Modelo en caché:', hasCachedModel ? 'Sí' : 'No');
        
        if (!hasCachedModel) {
          await modelStorage.downloadModel('/dracoFlora/floraOBJ.glb', (progress) => {
            console.log(`Progreso de descarga: ${progress.toFixed(2)}%`);
          });
          console.log('Modelo floraOBJ.glb precargado exitosamente');
        }
      } catch (error) {
        console.error('Error al precargar modelo floraOBJ.glb:', error);
      }
    };

    preloadModel();
  }, []);

  const gltf = useGLTF('/dracoFlora/floraOBJ.glb');
  const { camera } = useThree();
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [targetQuaternion, setTargetQuaternion] = useState<THREE.Quaternion | null>(null);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);
  const [currentQuaternion, setCurrentQuaternion] = useState<THREE.Quaternion | null>(null);
  const [currentView, setCurrentView] = useState('default');

  useFrame(() => {
    if (targetPosition && targetQuaternion && currentPosition && currentQuaternion && camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(
        currentPosition.x + (targetPosition.x - currentPosition.x) * 0.05,
        currentPosition.y + (targetPosition.y - currentPosition.y) * 0.05,
        currentPosition.z + (targetPosition.z - currentPosition.z) * 0.05
      );

      const newQuaternion = currentQuaternion.clone();
      newQuaternion.slerp(targetQuaternion, 0.05);

      camera.position.copy(newPosition);
      camera.quaternion.copy(newQuaternion);
      camera.updateProjectionMatrix();

      const positionDistance = newPosition.distanceTo(targetPosition);
      const rotationDistance = newQuaternion.angleTo(targetQuaternion);

      if (positionDistance < 0.01 && rotationDistance < 0.01) {
        if (!hasReachedTarget) {
          console.log('Camera reached target position:', {
            position: {
              x: newPosition.x.toFixed(2),
              y: newPosition.y.toFixed(2),
              z: newPosition.z.toFixed(2)
            },
            rotation: {
              x: newQuaternion.x.toFixed(2),
              y: newQuaternion.y.toFixed(2),
              z: newQuaternion.z.toFixed(2),
              w: newQuaternion.w.toFixed(2)
            }
          });
          setHasReachedTarget(true);
          setTimeout(() => {
            setIsInitialMovementComplete(true);
          }, 500);
        }
      }

      setCurrentPosition(newPosition);
      setCurrentQuaternion(newQuaternion);
    }
  });

  // Efecto para monitorear cambios en hasReachedTarget
  useEffect(() => {
    console.log('hasReachedTarget changed:', hasReachedTarget);
  }, [hasReachedTarget]);

  const moveToDefault = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(0.92, 1.52, 6.51);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-4.35),
        THREE.MathUtils.degToRad(-0.85),
        THREE.MathUtils.degToRad(-0.06)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      // Establecer la posición directamente
      camera.position.copy(newPosition);
      camera.quaternion.copy(newQuaternion);
      camera.updateProjectionMatrix();

      // Actualizar estados
      setCurrentPosition(newPosition);
      setCurrentQuaternion(newQuaternion);
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('default');
      onViewChange('default');
      setHasReachedTarget(true);
      setIsInitialMovementComplete(true);
    }
  };

  useEffect(() => {
    if (ref && 'current' in ref) {
      (ref.current as any).moveToDefault = moveToDefault;
    }
  }, [ref, moveToDefault]);

  useEffect(() => {
    try {
      if (ref && 'current' in ref && ref.current) {
        ref.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const material = child.material as THREE.Material;
            if (material instanceof THREE.MeshStandardMaterial) {
              if (material.map) material.map.colorSpace = 'srgb';
              if (material.emissiveMap) material.emissiveMap.colorSpace = 'srgb';
              if (material.roughnessMap) material.roughnessMap.colorSpace = 'srgb-linear';
              if (material.metalnessMap) material.metalnessMap.colorSpace = 'srgb-linear';
              if (material.normalMap) material.normalMap.colorSpace = 'srgb-linear';
              
              material.needsUpdate = true;
            }
          }
        });

        const box = new THREE.Box3().setFromObject(ref.current);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        ref.current.position.sub(center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        ref.current.scale.set(scale, scale, scale);

        if (camera instanceof THREE.PerspectiveCamera) {
          // Establecer la posición default directamente
          camera.position.set(0.92, 1.52, 6.51);
          const rotation = new THREE.Euler(
            THREE.MathUtils.degToRad(-4.35),
            THREE.MathUtils.degToRad(-0.85),
            THREE.MathUtils.degToRad(-0.06)
          );
          camera.quaternion.setFromEuler(rotation);
          camera.updateProjectionMatrix();

          // Actualizar estados para mantener la posición
          setCurrentPosition(camera.position.clone());
          setCurrentQuaternion(camera.quaternion.clone());
          setTargetPosition(camera.position.clone());
          setTargetQuaternion(camera.quaternion.clone());
          setHasReachedTarget(true);
          setIsInitialMovementComplete(true);
        }

        setIsModelLoaded(true);
      }
    } catch (e) {
      setError(`Error processing model: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [gltf, camera, ref]);

  // Exponer el estado de carga al componente padre
  useEffect(() => {
    if (ref && 'current' in ref) {
      (ref.current as any).isLoading = !(isInitialMovementComplete && isCarouselReady);
      // Exponer el estado de carga para que el componente padre pueda usarlo
      (ref.current as any).isLoadingState = !(isInitialMovementComplete && isCarouselReady);
    }
  }, [isInitialMovementComplete, isCarouselReady, ref]);

  if (error) {
    return null;
  }

  // Si está cargando, no permitir que se abra el mapa
  const effectiveShowMap = !(isInitialMovementComplete && isCarouselReady) ? false : showMap;

  return (
    <group ref={ref}>
      <primitive 
        object={gltf.scene} 
        scale={1}
        position={[0, 0, 0]}
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={20}
        target={[0, 0, 0]}
      />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-10, -10, -5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {hasReachedTarget && !effectiveShowMap && (
        <Html
          position={[0, 2, -2.5]}
          center
          style={{
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'all',
            zIndex: 10,
            transform: 'scale(120)'
          }}
          distanceFactor={0.05}
          transform={false}
          occlude={false}
          onOcclude={(visible) => {
            console.log('HTML visibility changed:', visible);
          }}
        >
          <div 
            style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div 
              style={{
                width: '380px',
                height: '600px',
                padding: '20px',
                borderRadius: '25px',
                backdropFilter: 'blur(15px) saturate(150%)',
                background: 'rgba(40, 40, 40, 0.85)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f0f0',
                fontFamily: 'Roboto, sans-serif',
                transform: 'scale(1)'
              }}
            >
              <PlantCarousel 
                showMap={effectiveShowMap} 
                onReady={() => setIsCarouselReady(true)}
              />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
});

export default Invernadero; 