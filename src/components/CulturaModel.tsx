import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Float, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import { TypingText } from './TypingText';
import { modelStorage } from '../services/modelStorage';

interface CircularButtonProps {
  position: [number, number, number];
  onClick: () => void;
  label: string;
  tooltip: string;
}

function CircularButton({ position, onClick, label, tooltip }: CircularButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Billboard
      position={position}
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <Html center>
        <div
          className="pulsing-button"
          onClick={onClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
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
        >
          {showTooltip && tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                fontFamily: 'Anton, sans-serif',
                letterSpacing: '1px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                zIndex: 2000
              }}
            >
              <TypingText text={tooltip} />
            </motion.div>
          )}
        </div>
      </Html>
    </Billboard>
  );
}

const CulturaModel = forwardRef<THREE.Group, { 
  onViewChange: (view: string) => void,
  showMap: boolean,
  onShowNews: (show: boolean) => void,
  onShowIndicadores: (show: boolean) => void,
  onShowEconomy: (show: boolean) => void,
  onShowContamination: (show: boolean) => void,
  onShowTourism: (show: boolean) => void,
  onShowProjects: (show: boolean) => void,
  onShowPueblos: (show: boolean) => void,
  onShowGaleria: (show: boolean) => void,
  onNavigationChange: (arrows: Array<{ position: string, direction: string, onClick: () => void }>) => void,
  openModal?: (content: string, title: string, onClose?: () => void) => void
}>(({ 
  onViewChange, 
  showMap, 
  onShowNews, 
  onShowIndicadores,
  onShowEconomy,
  onShowContamination,
  onShowTourism,
  onShowProjects,
  onShowPueblos,
  onShowGaleria,
  onNavigationChange,
  openModal
}, ref) => {
  const [error, setError] = useState<string | null>(null);
  const [showCinemaElements, setShowCinemaElements] = useState(true);
  const [showSportsElements, setShowSportsElements] = useState(true);
  
  // Precargar el modelo
  useEffect(() => {
    const preloadModel = async () => {
      try {
        console.log('Iniciando precarga del modelo cultura.glb...');
        const hasCachedModel = await modelStorage.hasModel('/dracoFlora/cultura.glb');
        console.log('Modelo en caché:', hasCachedModel ? 'Sí' : 'No');
        
        if (!hasCachedModel) {
          await modelStorage.downloadModel('/dracoFlora/cultura.glb', (progress) => {
            console.log(`Progreso de descarga: ${progress.toFixed(2)}%`);
          });
          console.log('Modelo cultura.glb precargado exitosamente');
        }
      } catch (error) {
        console.error('Error al precargar modelo cultura.glb:', error);
      }
    };

    preloadModel();
  }, []);

  const gltf = useGLTF('/dracoFlora/cultura.glb');
  const { camera } = useThree();
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [targetQuaternion, setTargetQuaternion] = useState<THREE.Quaternion | null>(null);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);
  const [currentQuaternion, setCurrentQuaternion] = useState<THREE.Quaternion | null>(null);
  const [currentView, setCurrentView] = useState('default');

  useFrame(() => {
    if (targetPosition && targetQuaternion && currentPosition && currentQuaternion && camera instanceof THREE.PerspectiveCamera) {
      // Interpolar posición
      const newPosition = new THREE.Vector3(
        currentPosition.x + (targetPosition.x - currentPosition.x) * 0.05,
        currentPosition.y + (targetPosition.y - currentPosition.y) * 0.05,
        currentPosition.z + (targetPosition.z - currentPosition.z) * 0.05
      );

      // Interpolar rotación usando slerp
      const newQuaternion = currentQuaternion.clone();
      newQuaternion.slerp(targetQuaternion, 0.05);

      // Actualizar cámara
      camera.position.copy(newPosition);
      camera.quaternion.copy(newQuaternion);
      camera.updateProjectionMatrix();

      // Actualizar estados
      setCurrentPosition(newPosition);
      setCurrentQuaternion(newQuaternion);
    }
  });

  const moveToDefault = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(5.25, -1.43, 10.18);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-87.30),
        THREE.MathUtils.degToRad(88.62),
        THREE.MathUtils.degToRad(87.30)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('default');
      onViewChange('default');
      
      // Reiniciar todos los estados asociados a las vistas
      onShowNews(false);
      onShowIndicadores(false);
      onShowEconomy(false);
      onShowContamination(false);
      onShowTourism(false);
      onShowProjects(false);
      onShowPueblos(false);
      onShowGaleria(false);
    }
  };

  const moveToWall1 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(-1.46, -1.75, 10.62);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-177.54),
        THREE.MathUtils.degToRad(0.94),
        THREE.MathUtils.degToRad(179.96)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall1');
      onViewChange('wall1');
      
      // Mostrar la galería en esta vista
      onShowNews(false);
      onShowIndicadores(false);
      onShowEconomy(false);
      onShowContamination(false);
      onShowTourism(false);
      onShowProjects(false);
      onShowPueblos(false);
      onShowGaleria(true);
    }
  };

  const moveToWall2 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(0.23, -1.93, 12.13);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(59.49),
        THREE.MathUtils.degToRad(88.34),
        THREE.MathUtils.degToRad(-59.47)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall2');
      onViewChange('wall2');
      
      // Reiniciar todos los estados
      onShowNews(false);
      onShowIndicadores(false);
      onShowEconomy(false);
      onShowContamination(false);
      onShowTourism(false);
      onShowProjects(false);
      onShowPueblos(false);
      onShowGaleria(false);
    }
  };

  const moveToWall3 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(1.42, -0.90, 11.27);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-70.65),
        THREE.MathUtils.degToRad(28.31),
        THREE.MathUtils.degToRad(53.49)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall3');
      onViewChange('wall3');
      
      // Reiniciar todos los estados
      onShowNews(false);
      onShowIndicadores(false);
      onShowEconomy(false);
      onShowContamination(false);
      onShowTourism(false);
      onShowProjects(false);
      onShowPueblos(false);
      onShowGaleria(false);
    }
  };

  const moveToWall4 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(-0.71, -1.81, 8.33);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(59.49),
        THREE.MathUtils.degToRad(88.34),
        THREE.MathUtils.degToRad(-59.47)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall4');
      onViewChange('wall4');
      
      // Reiniciar todos los estados
      onShowNews(false);
      onShowIndicadores(false);
      onShowEconomy(false);
      onShowContamination(false);
      onShowTourism(false);
      onShowProjects(false);
      onShowPueblos(false);
      onShowGaleria(false);
    }
  };

  const moveToWall5 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(-0.74, -1.58, 10.22);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(1.07),
        THREE.MathUtils.degToRad(1.98),
        THREE.MathUtils.degToRad(-0.04)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall5');
      onViewChange('wall5');
      
      // Reiniciar todos los estados
      onShowNews(false);
      onShowIndicadores(false);
      onShowEconomy(false);
      onShowContamination(false);
      onShowTourism(false);
      onShowProjects(false);
      onShowPueblos(false);
      onShowGaleria(false);
    }
  };

  // Exponer las funciones de movimiento al componente padre
  useEffect(() => {
    if (ref && 'current' in ref) {
      (ref.current as any).moveToWall1 = moveToWall1;
      (ref.current as any).moveToWall2 = moveToWall2;
      (ref.current as any).moveToWall3 = moveToWall3;
      (ref.current as any).moveToWall4 = moveToWall4;
      (ref.current as any).moveToWall5 = moveToWall5;
      (ref.current as any).moveToDefault = moveToDefault;
    }
  }, [ref, moveToWall1, moveToWall2, moveToWall3, moveToWall4, moveToWall5, moveToDefault]);

  // Configurar el modelo y la cámara
  useEffect(() => {
    try {
      if (ref && 'current' in ref && ref.current) {
        // Configurar el espacio de color de las texturas
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

        // Centrar el modelo
        const box = new THREE.Box3().setFromObject(ref.current);
        const center = box.getCenter(new THREE.Vector3());
        ref.current.position.sub(center);

        // Establecer la posición y rotación por defecto de la cámara
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.position.set(5.25, -1.43, 10.18);
          const rotation = new THREE.Euler(
            THREE.MathUtils.degToRad(-87.30),
            THREE.MathUtils.degToRad(88.62),
            THREE.MathUtils.degToRad(87.30)
          );
          camera.quaternion.setFromEuler(rotation);
          camera.updateProjectionMatrix();
        }
      }
    } catch (e) {
      setError(`Error processing model: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [gltf, camera, ref]);

  // No mostrar flechas de navegación
  useEffect(() => {
    onNavigationChange([]);
  }, [onNavigationChange]);

  if (error) {
    return null;
  }

  return (
    <group ref={ref}>
      <primitive 
        object={gltf.scene} 
        scale={1}
        position={[0, 0, 0]}
      />
      
      {/* Botones circulares solo en vista por defecto y cuando el mapa está cerrado */}
      {currentView === 'default' && !showMap && (
        <>
          <CircularButton 
            position={[-5.4, 0.1, 6.4]} 
            onClick={moveToWall1} 
            label="Pared 1" 
            tooltip="Deportes"
          />
          <CircularButton 
            position={[-6.4, 0, 2.7]} 
            onClick={moveToWall2} 
            label="Pared 2" 
            tooltip="Música"
          />
          <CircularButton 
            position={[-6.4, 0, -2.5]} 
            onClick={moveToWall4} 
            label="Pared 4" 
            tooltip="Biblioteca"
          />
          <CircularButton 
            position={[-6.4, 0, -6.7]} 
            onClick={moveToWall5} 
            label="Pared 5" 
            tooltip="Cine"
          />
          <CircularButton 
            position={[-6.4, -0.8, 1.5]} 
            onClick={moveToWall3} 
            label="Pared 3" 
            tooltip="Galería"
          />
        </>
      )}

      {currentView === 'wall1' && !showMap && showSportsElements && (
        <>
          <Html position={[-4.5, 1.75, 10.62]} center>
            <div
              style={{
                width: '200px',
                height: '160px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowSportsElements(false);
                openModal && openModal('/html/deporte.html', 'Deportes', () => {
                  setShowSportsElements(true);
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
          <Html position={[3.5, 2.55, 10.62]} center>
            <div
              style={{
                width: '200px',
                height: '160px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowSportsElements(false);
                openModal && openModal('/html/deporte.html', 'Deportes', () => {
                  setShowSportsElements(true);
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
          <Html position={[3.5, 0, 10.62]} center>
            <div
              style={{
                width: '200px',
                height: '160px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowSportsElements(false);
                openModal && openModal('/html/deporte.html', 'Deportes', () => {
                  setShowSportsElements(true);
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
        </>
      )}

      {(currentView === 'wall5' || currentView === 'default') && !showMap && showCinemaElements && (
        <>
          <Html position={[-5.9, 2.5, -15.62]} center>
            <div
              style={{
                width: '120px',
                height: '160px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowCinemaElements(false);
                openModal && openModal('/html/peliculas.html', 'Cine', () => {
                  setShowCinemaElements(true);
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
          <Html position={[-5.9, -1.5, -15.62]} center>
            <div
              style={{
                width: '120px',
                height: '160px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowCinemaElements(false);
                openModal && openModal('/html/peliculas.html', 'Cine', () => {
                  setShowCinemaElements(true);
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
          <Html position={[4.5, 2.5, -15.62]} center>
            <div
              style={{
                width: '120px',
                height: '160px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowCinemaElements(false);
                openModal && openModal('/html/peliculas.html', 'Cine', () => {
                  setShowCinemaElements(true);
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
          <Html position={[4.7, -1.5, -15.62]} center>
            <div
              style={{
                width: '120px',
                height: '160px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowCinemaElements(false);
                openModal && openModal('/html/peliculas.html', 'Cine', () => {
                  setShowCinemaElements(true);
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
        </>
      )}
    </group>
  );
});

export default CulturaModel; 