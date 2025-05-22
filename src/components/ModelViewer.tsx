import React, { useRef, useState, useEffect, Suspense, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, useGLTF, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Mapa from './Mapa';
import Modal from './Modal';
import GuayanaModel from './GuayanaModel';
import Invernadero from './Invernadero';
import CulturaModel from './CulturaModel';
import AcuarioModel, { AcuarioModelHandles } from './AcuarioModel';
import AnimalCarousel3D from './AnimalCarousel';
import Galeria from './Galeria';
import { saveModel, getModel } from '../utils/indexedDB';
import { modelStorage, AVAILABLE_MODELS } from '../services/modelStorage';
import { useModelLoader } from '../hooks/useModelLoader';

// Agregar estilos globales para la fuente Anton
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
`;
document.head.appendChild(style);

// Sonido para hover en botones circulares
const hoverSound = new Audio('/sounds/hover.mp3');
hoverSound.volume = 0.5;

// Hacer el sonido accesible globalmente
if (typeof window !== 'undefined') {
  window.hoverSound = hoverSound;
}

interface CameraState {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

interface InvernaderoRef extends THREE.Group {
  moveToDefault: () => void;
  isLoading?: boolean;
  isLoadingState?: boolean;
}

interface CircularButtonProps {
  position: [number, number, number];
  onClick: () => void;
  label: string;
  tooltip?: string;
}

function CircularButton({ position, onClick, label, tooltip }: CircularButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Html position={position} center>
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
  );
}

function NavigationArrow({ position, direction, onClick }: { position: string, direction: string, onClick: () => void }) {
  const getPositionStyle = () => {
    switch (position) {
      case 'left': return { left: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'right': return { right: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'top': return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom': return { bottom: '20px', left: '30%', transform: 'translateX(-50%)' };
      default: return { transform: 'none' };
    }
  };

  const getRotation = () => {
    switch (direction) {
      case 'up': return 0;
      case 'right': return 90;
      case 'down': return 180;
      case 'left': return 270;
      default: return 0;
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.8, 0.25, 1],
        exit: { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }
      }}
      onClick={onClick}
      style={{
        position: 'fixed',
        ...getPositionStyle(),
        width: '60px',
        height: '60px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '50%',
        padding: '10px',
        zIndex: 1000,
      }}
      whileHover={{
        opacity: 1,
        scale: 1.2,
        background: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <div style={{
        transform: `rotate(${getRotation()}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}

const Model = forwardRef<THREE.Group, { 
  url: string, 
  onViewChange: (view: string) => void, 
  showMap: boolean,
  onShowNews: (show: boolean) => void,
  onShowIndicadores: (show: boolean) => void,
  openModal?: (content: string, title: string, onClose?: () => void) => void,
  currentModel: string
}>(({ url, onViewChange, showMap, onShowNews, onShowIndicadores, openModal, currentModel }, ref) => {
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { gltf, loadingProgress: modelProgress, error: modelError, isLoaded } = useModelLoader(url);
  const { camera } = useThree();
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [targetQuaternion, setTargetQuaternion] = useState<THREE.Quaternion | null>(null);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);
  const [currentQuaternion, setCurrentQuaternion] = useState<THREE.Quaternion | null>(null);
  const [currentView, setCurrentView] = useState('default');
  const [showWall2Elements, setShowWall2Elements] = useState(true);

  // Efecto para precargar el modelo cuando se monta el componente
  useEffect(() => {
    if (modelError) {
      setError(modelError);
    }
  }, [modelError]);

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

  const moveToWall1 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(2.34, -0.74, -0.13);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-75.63),
        THREE.MathUtils.degToRad(88.17),
        THREE.MathUtils.degToRad(75.62)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall1');
      onViewChange('wall1');
      onShowIndicadores(true);
      onShowNews(false);
    }
  };

  const moveToWall2 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(2.25, -0.74, -0.48);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-2.55),
        THREE.MathUtils.degToRad(54.62),
        THREE.MathUtils.degToRad(2.08)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall2');
      onViewChange('wall2');
      onShowNews(true);
      onShowIndicadores(false);
    }
  };

  const moveToWall3 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(2.50, -0.31, 0.07);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-173.07),
        THREE.MathUtils.degToRad(48.48),
        THREE.MathUtils.degToRad(174.80)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall3');
      onViewChange('wall3');
      onShowNews(false);
      onShowIndicadores(false);
    }
  };

  const moveToDefault = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(5.98, -0.59, -0.40);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-90.31),
        THREE.MathUtils.degToRad(78.80),
        THREE.MathUtils.degToRad(90.31)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('default');
      onViewChange('default');
      onShowNews(false);
      onShowIndicadores(false);
    }
  };

  // Exponer las funciones de movimiento al componente padre
  useEffect(() => {
    if (ref && 'current' in ref) {
      (ref.current as any).moveToWall1 = moveToWall1;
      (ref.current as any).moveToWall2 = moveToWall2;
      (ref.current as any).moveToWall3 = moveToWall3;
      (ref.current as any).moveToDefault = moveToDefault;
    }
  }, [ref, moveToWall1, moveToWall2, moveToWall3, moveToDefault]);

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
              
              // Actualiza el material para reflejar estos cambios
              material.needsUpdate = true;
            }
          }
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(ref.current);
        const center = box.getCenter(new THREE.Vector3());
        ref.current.position.sub(center);

        // Adjust camera to fit model
        if (camera instanceof THREE.PerspectiveCamera) {
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
          camera.position.z = cameraZ * 1.5;
          camera.updateProjectionMatrix();
        }
      }
    } catch (e) {
      setError(`Error processing model: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [gltf, camera, ref]);

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
            position={[0, 0.7, 0]} 
            onClick={moveToWall1} 
            label="Pared 1" 
            tooltip="Indicadores" 
          />
          <CircularButton 
            position={[0, 0.7, -3.5]} 
            onClick={moveToWall2} 
            label="Pared 2" 
            tooltip="Noticias" 
          />
          <CircularButton 
            position={[0, 0.7, 3.5]} 
            onClick={moveToWall3} 
            label="Pared 3" 
            tooltip="Sobre Nosotros" 
          />
        </>
      )}

      {currentView === 'wall2' && !showMap && showWall2Elements && (
        <>
          <Html position={[-0.5, 2, -2]} center>
            <div
              onClick={() => {
                setShowWall2Elements(false);
                if (openModal) {
                  openModal('/html/listarticulos.html', 'Artículos', () => {
                    setShowWall2Elements(true);
                  });
                }
              }}
              style={{
                width: '140px',
                height: '250px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            />
          </Html>
          <Html position={[2.45, 2.1, -2]} center>
            <div
              onClick={() => {
                setShowWall2Elements(false);
                if (openModal) {
                  openModal('/html/listarticulos.html', 'Artículos', () => {
                    setShowWall2Elements(true);
                  });
                }
              }}
              style={{
                width: '140px',
                height: '250px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            />
          </Html>
          <Html position={[3.42, 2.1, -2]} center>
            <div
              onClick={() => {
                setShowWall2Elements(false);
                if (openModal) {
                  openModal('/html/listarticulos.html', 'Artículos', () => {
                    setShowWall2Elements(true);
                  });
                }
              }}
              style={{
                width: '140px',
                height: '250px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            />
          </Html>
        </>
      )}

      {currentView === 'wall1' && currentModel === 'cultura' && !showMap && (
        <>
          <Html position={[-0.5, 2, -2]} center>
            <div
              onClick={() => {
                if (openModal) {
                  openModal('/html/deporte.html', 'Deportes');
                }
              }}
              style={{
                width: '140px',
                height: '250px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
          <Html position={[2.45, 2.1, -2]} center>
            <div
              onClick={() => {
                if (openModal) {
                  openModal('/html/deporte.html', 'Deportes');
                }
              }}
              style={{
                width: '140px',
                height: '250px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
          <Html position={[3.42, 2.1, -2]} center>
            <div
              onClick={() => {
                if (openModal) {
                  openModal('/html/deporte.html', 'Deportes');
                }
              }}
              style={{
                width: '140px',
                height: '250px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Html>
        </>
      )}
      {currentModel === 'cultura' && currentView === 'wall1' && !showMap && (
        <Html position={[-1.46, -1.75, 10.62]} center>
          <div
            style={{
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => openModal && openModal('/html/deporte.html', 'Deportes')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        </Html>
      )}
    </group>
  );
});

function LoadingOverlay({ isPreloading, preloadProgress }: { isPreloading: boolean, preloadProgress: number }) {
  const { progress } = useProgress();
  const totalProgress = isPreloading ? (preloadProgress + progress) / 2 : progress;

  return totalProgress < 100 ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.95)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      gap: '20px'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src="/logo-museo.png" 
          alt="Logo Museo"
          style={{
            width: '400px',
            height: 'auto',
            marginBottom: '2px'
          }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          color: '#ffffff',
          fontSize: '24px',
          fontFamily: '"Anton", sans-serif',
          letterSpacing: '2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div style={{
          fontSize: '20px',
          opacity: 0.8
        }}>
          {totalProgress.toFixed(0)}%
        </div>
        <div style={{
          width: '200px',
          height: '2px',
          background: 'rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1px'
        }}>
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              background: 'white',
              position: 'absolute',
              left: 0,
              transformOrigin: '0%',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: totalProgress / 100 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {isPreloading && (
          <div style={{
            fontSize: '16px',
            opacity: 0.6,
            marginTop: '10px'
          }}>
            Precargando modelos...
          </div>
        )}
      </motion.div>
    </div>
  ) : null;
}

function CameraPosition({ onPositionChange }: { onPositionChange: (pos: CameraState) => void }) {
  const { camera } = useThree();

  useFrame(() => {
    onPositionChange({
      x: Number(camera.position.x.toFixed(2)),
      y: Number(camera.position.y.toFixed(2)),
      z: Number(camera.position.z.toFixed(2)),
      rotX: Number((camera.rotation.x * (180/Math.PI)).toFixed(2)),
      rotY: Number((camera.rotation.y * (180/Math.PI)).toFixed(2)),
      rotZ: Number((camera.rotation.z * (180/Math.PI)).toFixed(2))
    });
  });

  return null;
}

function CameraController({ onModelChange }: { onModelChange: (model: ModelType) => void }) {
  const { camera } = useThree();

  const setCameraPosition = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(5.98, -0.59, -0.40);
      const rotation = new THREE.Euler(
        THREE.MathUtils.degToRad(124.14),
        THREE.MathUtils.degToRad(83.20),
        THREE.MathUtils.degToRad(-124.32)
      );
      camera.quaternion.setFromEuler(rotation);
      camera.updateProjectionMatrix();
    }
  };

  useEffect(() => {
    setCameraPosition();
  }, [camera]);

  return null;
}

// Definir interfaz SceneProps
interface SceneProps {
  showControls: boolean;
  onCameraPositionChange: (pos: CameraState) => void;
  onViewChange: (view: string) => void;
  modelRef: React.RefObject<THREE.Group | null>;
  acuarioRef: React.RefObject<AcuarioModelHandles | null>;
  invernaderoRef: React.RefObject<InvernaderoRef | null>;
  currentModel: string;
  showMap: boolean;
  onShowNews: (show: boolean) => void;
  onShowIndicadores: (show: boolean) => void;
  onShowEconomy: (show: boolean) => void;
  onShowContamination: (show: boolean) => void;
  onShowTourism: (show: boolean) => void;
  onShowProjects: (show: boolean) => void;
  onShowPueblos: (show: boolean) => void;
  onShowGaleria: (show: boolean) => void;
  isInitialLoad: boolean;
  showLobbyText: boolean;
  activeText: string | null;
  setActiveText: (text: string | null) => void;
  setShowIndicadoresText: (show: boolean) => void;
  setShowNewsText: (show: boolean) => void;
  setShowEconomyText: (show: boolean) => void;
  setShowContaminationText: (show: boolean) => void;
  setShowTourismText: (show: boolean) => void;
  setShowProjectsText: (show: boolean) => void;
  setShowPueblosText: (show: boolean) => void;
  setShowDeportesText: (show: boolean) => void;
  setShowMusicaText: (show: boolean) => void;
  setShowGaleriaText: (show: boolean) => void;
  setShowBibliotecaText: (show: boolean) => void;
  setShowCineText: (show: boolean) => void;
  openModal?: (content: string, title: string, onClose?: () => void) => void;
}

function Scene({ 
  showControls, 
  onCameraPositionChange, 
  onViewChange, 
  modelRef, 
  acuarioRef,
  invernaderoRef,
  currentModel, 
  showMap,
  onShowNews,
  onShowIndicadores,
  onShowEconomy,
  onShowContamination,
  onShowTourism,
  onShowProjects,
  onShowPueblos,
  onShowGaleria,
  isInitialLoad,
  showLobbyText,
  activeText,
  setActiveText,
  setShowIndicadoresText,
  setShowNewsText,
  setShowEconomyText,
  setShowContaminationText,
  setShowTourismText,
  setShowProjectsText,
  setShowPueblosText,
  setShowDeportesText,
  setShowMusicaText,
  setShowGaleriaText,
  setShowBibliotecaText,
  setShowCineText,
  openModal
}: SceneProps) {
  const { camera } = useThree();
  const [showNewsText, setShowNewsTextState] = useState(false);
  const [showEconomyText, setShowEconomyTextState] = useState(false);
  const [showContaminationText, setShowContaminationTextState] = useState(false);
  const [showTourismText, setShowTourismTextState] = useState(false);
  const [showProjectsText, setShowProjectsTextState] = useState(false);
  const [showPueblosText, setShowPueblosTextState] = useState(false);
  const [showDeportesText, setShowDeportesTextState] = useState(false);
  const [showMusicaText, setShowMusicaTextState] = useState(false);
  const [showGaleriaText, setShowGaleriaTextState] = useState(false);
  const [showBibliotecaText, setShowBibliotecaTextState] = useState(false);
  const [showCineText, setShowCineTextState] = useState(false);
  const [currentView, setCurrentView] = useState('default');
  const [navigationArrows, setNavigationArrows] = useState<Array<{ position: string, direction: string, onClick: () => void }>>([]);
  const [showWall2Elements, setShowWall2Elements] = useState(true);

  // Actualiza los estados locales cuando cambian los props externos
  useEffect(() => {
    if (showNewsText !== undefined) setShowNewsTextState(showNewsText);
  }, [showNewsText]);

  useEffect(() => {
    if (showEconomyText !== undefined) setShowEconomyTextState(showEconomyText);
  }, [showEconomyText]);

  // ... Se pueden agregar los demás useEffects similares si es necesario

  const handleNavigationChange = (arrows: Array<{ position: string, direction: string, onClick: () => void }>) => {
    setNavigationArrows(arrows);
  };

  // Inicializar la cámara solo cuando cambie el modelo
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(5.98, -0.59, -0.40);
      const rotation = new THREE.Euler(
        THREE.MathUtils.degToRad(124.14),
        THREE.MathUtils.degToRad(83.20),
        THREE.MathUtils.degToRad(-124.32)
      );
      camera.quaternion.setFromEuler(rotation);
      camera.updateProjectionMatrix();
    }
  }, [camera, currentModel]);

  // Ahora reemplazamos el useEffect que causa problemas
  useEffect(() => {
    if (!isInitialLoad && !showLobbyText) {
      if (currentView === 'default') {
        if (setActiveText) setActiveText(null);
      } else {
        if (currentModel === 'default') {
          // Lógica específica para el modelo default
          switch (currentView) {
            case 'wall1':
              if (setActiveText) setActiveText('indicadores');
              if (setShowIndicadoresText) setShowIndicadoresText(true);
              break;
            case 'wall2':
              if (setActiveText) setActiveText('noticias');
              if (setShowNewsText) setShowNewsText(true);
              break;
            case 'wall3':
              if (setActiveText) setActiveText(null);
              break;
          }
        } else if (currentModel === 'guayana' || currentModel === 'cultura') {
          switch (currentView) {
            case 'wall1':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('economia');
                if (setShowEconomyText) setShowEconomyText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('deportes');
                if (setShowDeportesText) setShowDeportesText(true);
              }
              break;
            case 'wall2':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('pueblos');
                if (setShowPueblosText) setShowPueblosText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('musica');
                if (setShowMusicaText) setShowMusicaText(true);
              }
              break;
            case 'wall3':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('turismo');
                if (setShowTourismText) setShowTourismText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('galeria');
                if (setShowGaleriaText) setShowGaleriaText(true);
              }
              break;
            case 'wall4':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('proyectos');
                if (setShowProjectsText) setShowProjectsText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('biblioteca');
                if (setShowBibliotecaText) setShowBibliotecaText(true);
              }
              break;
            case 'wall5':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('contaminacion');
                if (setShowContaminationText) setShowContaminationText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('cine');
                if (setShowCineText) setShowCineText(true);
              }
              break;
          }
        }
      }
    }
  }, [currentView, currentModel, isInitialLoad, showLobbyText, setActiveText, setShowIndicadoresText, setShowNewsText, 
      setShowEconomyText, setShowContaminationText, setShowTourismText, setShowProjectsText, 
      setShowPueblosText, setShowDeportesText, setShowMusicaText, setShowGaleriaText, 
      setShowBibliotecaText, setShowCineText]);

  // Agregar este efecto después de los otros useEffect
  useEffect(() => {
    // Si hay flechas visibles (currentView !== 'default') y el modelo cambia
    if (currentView !== 'default' && modelRef.current && typeof (modelRef.current as any).moveToDefault === 'function') {
      // Pequeño timeout para asegurar que el nuevo modelo esté cargado
      setTimeout(() => {
        if (modelRef.current && typeof (modelRef.current as any).moveToDefault === 'function') {
          (modelRef.current as any).moveToDefault();
          setCurrentView('default');
        }
      }, 100);
    }
  }, [currentModel]);

  // ... resto del componente Scene sin cambios

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 5, 20]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-10, -10, -5]}
        intensity={0.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      <Environment 
        files={currentModel === 'cultura' ? '/hdri/sunset.hdr' : '/hdri/city.hdr'}
        background={false}
        blur={0.5}
      />
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={currentModel === 'cultura' ? 0.3 : 0.4}
        scale={10}
        blur={2.5}
        far={4}
      />
      
      <CameraPosition onPositionChange={onCameraPositionChange} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={currentModel === 'invernadero' || showControls}
        minDistance={1}
        maxDistance={20}
        target={[0, 0, 0]}
      />
      
      {currentModel === 'default' ? (
        <group>
          <Float
            speed={1}
            rotationIntensity={0}
            floatIntensity={0}
            floatingRange={[0, 0]}
          >
            <Model 
              url="/dracoFlora/proyecto.glb" 
              onViewChange={onViewChange} 
              ref={modelRef} 
              showMap={showMap} 
              onShowNews={(show) => onShowNews(show)}
              onShowIndicadores={(show) => onShowIndicadores(show)}
              openModal={openModal}
              currentModel={currentModel}
            />
          </Float>
        </group>
      ) : currentModel === 'guayana' ? (
        <group>
          <Float
            speed={1}
            rotationIntensity={0}
            floatIntensity={0}
            floatingRange={[0, 0]}
          >
            <GuayanaModel 
              ref={modelRef}
              onViewChange={onViewChange}
              onNavigationChange={handleNavigationChange}
              onShowNews={onShowNews}
              onShowEconomy={onShowEconomy}
              onShowContamination={onShowContamination}
              onShowTourism={onShowTourism}
              onShowProjects={onShowProjects}
              onShowPueblos={onShowPueblos}
              showMap={showMap}
              openModal={openModal}
            />
          </Float>
        </group>
      ) : currentModel === 'invernadero' ? (
        <group>
          <Float
            speed={1}
            rotationIntensity={0}
            floatIntensity={0}
            floatingRange={[0, 0]}
          >
            <Invernadero 
              ref={invernaderoRef}
              onViewChange={onViewChange}
              showMap={showMap}
            />
          </Float>
          {/* Agregar luces adicionales para el invernadero */}
          <spotLight
            position={[5, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <spotLight
            position={[-5, 5, -5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <hemisphereLight
            intensity={0.5}
            groundColor={new THREE.Color('#080820')}
            color={new THREE.Color('#ffffff')}
          />
        </group>
      ) : currentModel === 'cultura' ? (
        <CulturaModel
          ref={modelRef}
          onViewChange={onViewChange}
          showMap={showMap}
          onShowNews={onShowNews}
          onShowIndicadores={onShowIndicadores}
          onShowEconomy={onShowEconomy}
          onShowContamination={onShowContamination}
          onShowTourism={onShowTourism}
          onShowProjects={onShowProjects}
          onShowPueblos={onShowPueblos}
          onShowGaleria={onShowGaleria}
          onNavigationChange={setNavigationArrows}
          openModal={openModal}
        />
      ) : currentModel === 'acuario' ? (
        <group>
          <Float
            speed={1}
            rotationIntensity={0}
            floatIntensity={0}
            floatingRange={[0, 0]}
          >
            <AcuarioModel 
              ref={acuarioRef}
              onViewChange={onViewChange}
              showMap={showMap}
              isActive={true}
            />
          </Float>
        </group>
      ) : null}

      <AnimatePresence mode="sync">
        {navigationArrows.map((arrow, index) => (
          <NavigationArrow
            key={`${arrow.position}-${arrow.direction}`}
            position={arrow.position}
            direction={arrow.direction}
            onClick={arrow.onClick}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode, onError: (error: Error) => void }> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

function NewsTextAnimation({ isVisible, text, position = '75%', customStyle = {}, isModelChange = false }: { 
  isVisible: boolean, 
  text: string, 
  position?: string,
  customStyle?: React.CSSProperties,
  isModelChange?: boolean
}) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={isVisible ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
      transition={isModelChange ? { duration: 0 } : { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
      style={{
        position: 'fixed',
        top: position,
        left: '37.5%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '3rem',
        fontWeight: '400',
        fontFamily: '"Anton", sans-serif',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        zIndex: 1000,
        pointerEvents: 'none',
        visibility: isVisible ? 'visible' : 'hidden',
        ...customStyle
      }}
    >
      {text}
    </motion.div>
  );
}

// Agregar el componente TypingText antes del componente ModelViewer
const TypingText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50); // Velocidad de tipeo

    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.span
      animate={{ opacity: isTyping ? 1 : 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {displayText}
      {isTyping && <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >|</motion.span>}
    </motion.span>
  );
};

// Actualizar las interfaces y tipos
type ModelType = 'default' | 'guayana' | 'invernadero' | 'cultura' | 'acuario';
type ViewType = 'default' | 'wall1' | 'wall2' | 'wall3' | 'wall4' | 'wall5';

// Agregar este nuevo componente antes del componente ModelViewer
function SpecialModelText({ show, model }: { show: boolean, model: 'acuario' | 'invernadero' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.8, 0.25, 1]
          }}
          style={{
            position: 'fixed',
            top: '50%',
            left: model === 'invernadero' ? '37%' : '41%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '4rem',
            fontWeight: '400',
            fontFamily: '"Anton", sans-serif',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            zIndex: 2147483647,
            pointerEvents: 'none',
          }}
        >
          {model === 'invernadero' ? 'INVERNADERO' : 'ACUARIO'}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModelViewer() {
  const [error, setError] = useState<string | null>(null);
  const [showLobbyText, setShowLobbyText] = useState(false);
  const [showUIElements, setShowUIElements] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraState>({ 
    x: 5.98, 
    y: -0.59, 
    z: -0.40,
    rotX: 124.14,
    rotY: 83.20,
    rotZ: -124.32
  });
  const [currentView, setCurrentView] = useState<ViewType>('default');
  const [showMap, setShowMap] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelType>('default');
  const [showNewsText, setShowNewsText] = useState(false);
  const [showIndicadoresText, setShowIndicadoresText] = useState(false);
  const [showEconomyText, setShowEconomyText] = useState(false);
  const [showContaminationText, setShowContaminationText] = useState(false);
  const [showTourismText, setShowTourismText] = useState(false);
  const [showProjectsText, setShowProjectsText] = useState(false);
  const [showPueblosText, setShowPueblosText] = useState(false);
  const [showDeportesText, setShowDeportesText] = useState(false);
  const [showMusicaText, setShowMusicaText] = useState(false);
  const [showGaleriaText, setShowGaleriaText] = useState(false);
  const [showBibliotecaText, setShowBibliotecaText] = useState(false);
  const [showCineText, setShowCineText] = useState(false);
  const [contenido, setContenido] = useState('/html/listarticulos.html');
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    content: string;
    title: string;
    onClose?: () => void;
  }>({
    isOpen: false,
    content: '',
    title: '',
    onClose: undefined
  });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const modelRef = useRef<THREE.Group | null>(null);
  const acuarioRef = useRef<AcuarioModelHandles | null>(null);
  const invernaderoRef = useRef<InvernaderoRef | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTransitionUI, setShowTransitionUI] = useState(true);
  const [activeText, setActiveText] = useState<string | null>(null);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);

  const { progress } = useProgress();

  // Efecto para precargar todos los modelos al iniciar
  useEffect(() => {
    const preloadAllModels = async () => {
      try {
        setIsPreloading(true);
        await modelStorage.preloadAllModels((progress) => {
          setPreloadProgress(progress);
        });
        setIsPreloading(false);
      } catch (error) {
        console.error('Error al precargar modelos:', error);
        setIsPreloading(false);
      }
    };

    preloadAllModels();
  }, []);

  // Efecto para cargar modelos desde IndexedDB al iniciar
  useEffect(() => {
    const loadModelsFromIndexedDB = async () => {
      try {
        const defaultModel = await getModel('default');
        const guayanaModel = await getModel('guayana');
        const invernaderoModel = await getModel('invernadero');
        const culturaModel = await getModel('cultura');
        const acuarioModel = await getModel('acuario');

        console.log('Modelos cargados desde IndexedDB:', {
          default: defaultModel,
          guayana: guayanaModel,
          invernadero: invernaderoModel,
          cultura: culturaModel,
          acuario: acuarioModel
        });
      } catch (error) {
        console.error('Error al cargar modelos desde IndexedDB:', error);
      }
    };

    loadModelsFromIndexedDB();
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Verificamos que el modelo esté cargado
      const checkModelLoaded = setInterval(() => {
        if (modelRef.current && typeof (modelRef.current as any).moveToDefault === 'function') {
          clearInterval(checkModelLoaded);
          
          // Movemos la cámara a la posición default
          (modelRef.current as any).moveToDefault();
          
          // Esperamos a que la cámara esté en posición
          setTimeout(() => {
            if (currentModel === 'invernadero') {
              // Para el invernadero, mostramos directamente la UI y el texto sin mostrar el mapa
              setIsModelLoaded(true);
              setShowUIElements(true);
              setShowLobbyText(true);
              
              // Ocultamos el texto de lobby después de 2 segundos
              setTimeout(() => {
                setShowLobbyText(false);
                setIsInitialLoad(false);
              }, 2000);
            } else {
              // Para otros modelos, mostramos el mapa brevemente
              setShowMap(true);
              
              // Cerramos el mapa inmediatamente
              setTimeout(() => {
                setShowMap(false);
                
                // Después de que el mapa se cierre, mostramos la UI y el texto
                setTimeout(() => {
                  setIsModelLoaded(true);
                  setShowUIElements(true);
                  setShowLobbyText(true);
                  
                  // Ocultamos el texto de lobby después de 2 segundos
                  setTimeout(() => {
                    setShowLobbyText(false);
                    setIsInitialLoad(false);
                  }, 2000);
                }, 100);
              }, 100);
            }
          }, 1000);
        }
      }, 100);
    }
  }, [progress, currentModel]);

  // Efecto para manejar la visibilidad de los textos basado en la vista actual
  useEffect(() => {
    if (!isInitialLoad && !showLobbyText) {
      if (currentView === 'default') {
        if (setActiveText) setActiveText(null);
      } else {
        if (currentModel === 'default') {
          // Lógica específica para el modelo default
          switch (currentView) {
            case 'wall1':
              if (setActiveText) setActiveText('indicadores');
              if (setShowIndicadoresText) setShowIndicadoresText(true);
              break;
            case 'wall2':
              if (setActiveText) setActiveText('noticias');
              if (setShowNewsText) setShowNewsText(true);
              break;
            case 'wall3':
              if (setActiveText) setActiveText(null);
              break;
          }
        } else if (currentModel === 'guayana' || currentModel === 'cultura') {
          switch (currentView) {
            case 'wall1':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('economia');
                if (setShowEconomyText) setShowEconomyText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('deportes');
                if (setShowDeportesText) setShowDeportesText(true);
              }
              break;
            case 'wall2':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('pueblos');
                if (setShowPueblosText) setShowPueblosText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('musica');
                if (setShowMusicaText) setShowMusicaText(true);
              }
              break;
            case 'wall3':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('turismo');
                if (setShowTourismText) setShowTourismText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('galeria');
                if (setShowGaleriaText) setShowGaleriaText(true);
              }
              break;
            case 'wall4':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('proyectos');
                if (setShowProjectsText) setShowProjectsText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('biblioteca');
                if (setShowBibliotecaText) setShowBibliotecaText(true);
              }
              break;
            case 'wall5':
              if (currentModel === 'guayana') {
                if (setActiveText) setActiveText('contaminacion');
                if (setShowContaminationText) setShowContaminationText(true);
              } else if (currentModel === 'cultura') {
                if (setActiveText) setActiveText('cine');
                if (setShowCineText) setShowCineText(true);
              }
              break;
          }
        }
      }
    }
  }, [currentView, currentModel, isInitialLoad, showLobbyText, setActiveText, setShowIndicadoresText, setShowNewsText, 
      setShowEconomyText, setShowContaminationText, setShowTourismText, setShowProjectsText, 
      setShowPueblosText, setShowDeportesText, setShowMusicaText, setShowGaleriaText, 
      setShowBibliotecaText, setShowCineText]);

  // Modificar el useEffect que maneja el showLobbyText cuando cambia el modelo
  useEffect(() => {
    if ((currentModel === 'invernadero' || currentModel === 'default' || currentModel === 'guayana') && showLobbyText) {
      const timer = setTimeout(() => {
        setShowLobbyText(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentModel, showLobbyText]);

  const openModal = (content: string, title: string, onClose?: () => void): void => {
    // Resetear todos los estados de texto para evitar conflictos entre secciones
    setShowNewsText(false);
    setShowIndicadoresText(false);
    setShowEconomyText(false);
    setShowContaminationText(false);
    setShowTourismText(false);
    setShowProjectsText(false);
    setShowPueblosText(false);
    setShowDeportesText(false);
    setShowMusicaText(false);
    setShowGaleriaText(false);
    setShowBibliotecaText(false);
    setShowCineText(false);
    
    let contenidoFinal = '';
    
    // Determinar el contenido basado en el modelo actual y la vista actual
    if (currentModel === 'cultura') {
      // Para la sección de cultura
      switch (currentView) {
        case 'wall1': // Deportes
          contenidoFinal = '/html/deporte.html';
          break;
        case 'wall2': // Música
          contenidoFinal = '/html/musica.html';
          break;
        case 'wall3': // Galería
          contenidoFinal = '/html/articulos.html';
          break;
        case 'wall4': // Biblioteca
          contenidoFinal = '/html/listalibrosyleyendas.html';
          break;
        case 'wall5': // Cine
          contenidoFinal = '/html/peliculas.html';
          break;
        default:
          contenidoFinal = '/html/listarticulos.html';
      }
    } else if (currentModel === 'guayana') {
      // Para la sección de guayana
      switch (currentView) {
        case 'wall1': // Economía
          contenidoFinal = '/html/listaarticulosEconomia.html';
          title = 'Economía';
          break;
        case 'wall2': // Nuestros Pueblos
          contenidoFinal = '/html/indigenas.html';
          title = 'Nuestros Pueblos';
          break;
        case 'wall3': // Turismo
          contenidoFinal = '/html/turismo.html';
          title = 'Turismo';
          break;
        case 'wall4': // Proyectos
          contenidoFinal = '/html/proyectos.html';
          title = 'Proyectos';
          break;
        case 'wall5': // Contaminación
          contenidoFinal = '/html/listaarticulosContaminacion.html';
          title = 'Contaminación';
          break;
        default:
          contenidoFinal = '/html/listarticulos.html';
      }
    } else if (content) {
      contenidoFinal = content;
    } else {
      // Valor por defecto si no hay coincidencia
      contenidoFinal = '/html/listarticulos.html';
    }
    
    setActiveModal({
      isOpen: true,
      content: contenidoFinal,
      title,
      onClose
    });
  };

  const closeModal = (): void => {
    if (activeModal.onClose) {
      activeModal.onClose();
    }
    
    setActiveModal(prev => ({
      ...prev,
      isOpen: false,
      onClose: undefined
    }));
    
    // Al cerrar el modal, actualizar los estados de texto según la vista y modelo actuales
    if (currentModel === 'cultura') {
      switch (currentView) {
        case 'wall1':
          if (setActiveText) setActiveText('deportes');
          if (setShowDeportesText) setShowDeportesText(true);
          break;
        case 'wall2':
          if (setActiveText) setActiveText('musica');
          if (setShowMusicaText) setShowMusicaText(true);
          break;
        case 'wall3':
          if (setActiveText) setActiveText('galeria');
          if (setShowGaleriaText) setShowGaleriaText(true);
          break;
        case 'wall4':
          if (setActiveText) setActiveText('biblioteca');
          if (setShowBibliotecaText) setShowBibliotecaText(true);
          break;
        case 'wall5':
          if (setActiveText) setActiveText('cine');
          if (setShowCineText) setShowCineText(true);
          break;
      }
    } else if (currentModel === 'guayana') {
      switch (currentView) {
        case 'wall1':
          if (setActiveText) setActiveText('economia');
          if (setShowEconomyText) setShowEconomyText(true);
          break;
        case 'wall2':
          if (setActiveText) setActiveText('pueblos');
          if (setShowPueblosText) setShowPueblosText(true);
          break;
        case 'wall3':
          if (setActiveText) setActiveText('turismo');
          if (setShowTourismText) setShowTourismText(true);
          break;
        case 'wall4':
          if (setActiveText) setActiveText('proyectos');
          if (setShowProjectsText) setShowProjectsText(true);
          break;
        case 'wall5':
          if (setActiveText) setActiveText('contaminacion');
          if (setShowContaminationText) setShowContaminationText(true);
          break;
      }
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewType);
    if (view === 'wall1') {
      setContenido('/html/indicadores.html');
    } else if (view === 'wall2') {
      setContenido('/html/listarticulos.html');
    } else if (view === 'wall3') {
      setContenido('/html/listarticulos.html');
    }
  };

  const getVisibleArrows = () => {
    if (currentView === 'default') return [];
    const arrows = [];
    
    // Flecha para volver a la vista por defecto
    arrows.push({
      position: 'bottom',
      direction: 'right',
      onClick: () => {
        if (modelRef.current) {
          (modelRef.current as any).moveToDefault();
        }
      }
    });

    // Configuración para los modelos Guayana y Cultura (5 paredes)
    if (currentModel === 'guayana') {
      switch (currentView) {
        case 'wall1':
          arrows.push({
            position: 'right',
            direction: 'up',
            onClick: () => {
              if (modelRef.current) {
                (modelRef.current as any).moveToWall2();
              }
            }
          });
          break;

        case 'wall2':
          arrows.push(
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall1();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall3();
                }
              }
            }
          );
          break;

        case 'wall3':
          arrows.push(
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall2();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall5();
                }
              }
            }
          );
          break;

        case 'wall4':
          arrows.push(
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall3();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall5();
                }
              }
            }
          );
          break;

        case 'wall5':
          arrows.push({
            position: 'left',
            direction: 'down',
            onClick: () => {
              if (modelRef.current) {
                (modelRef.current as any).moveToWall3();
              }
            }
          });
          break;
      }
    } 
    else if (currentModel === 'cultura') {
         switch (currentView) {
        case 'wall1':
          arrows.push({
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall3();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall2();
                }
              }
            }
          );
          break;

        case 'wall2':
          arrows.push(
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall1();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall4();
                }
              }
            }
          );
          break;

        case 'wall3':
          arrows.push(
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall1();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall5();
                }
              }
            }
          );
          break;

        case 'wall4':
          arrows.push(
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall2();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall5();
                }
              }
            }
          );
          break;

        case 'wall5':
          arrows.push(
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall4();
                }
              }
            },
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall3();
                }
              }
            }
          );
          break;
      }
    }else {
      // Configuración para el modelo por defecto (3 paredes)
      switch (currentView) {
        case 'wall1':
          arrows.push(
            {
              position: 'right',
              direction: 'up',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall2();
                }
              }
            },
            {
              position: 'left',
              direction: 'down',
              onClick: () => {
                if (modelRef.current) {
                  (modelRef.current as any).moveToWall3();
                }
              }
            }
          );
          break;

        case 'wall2':
          arrows.push({
            position: 'left',
            direction: 'down',
            onClick: () => {
              if (modelRef.current) {
                (modelRef.current as any).moveToWall1();
              }
            }
          });
          break;

        case 'wall3':
          arrows.push({
            position: 'right',
            direction: 'up',
            onClick: () => {
              if (modelRef.current) {
                (modelRef.current as any).moveToWall1();
              }
            }
          });
          break;
      }
    }
    return arrows;
  };

  // Agregar estilos globales para la animación del pulso
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.5;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 0.5;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Agregar useEffect para debug
  useEffect(() => {
    console.log('NewsTextAnimation props:', {
      showNewsText,
      currentModel,
      currentView,
      isVisible: showNewsText && (currentModel === 'default' || (currentModel === 'guayana' && currentView === 'wall1'))
    });
  }, [showNewsText, currentModel, currentView]);

  // Actualizar la función handleModelChange
  const handleModelChange = (newModel: ModelType) => {
    if (newModel === currentModel) {
      return;
    }

    setIsTransitioning(true);
    setShowUIElements(false);
    setShowLobbyText(false);
    setActiveText(null);
    setCurrentView('default'); // Forzar la vista a default al cambiar de modelo
    
    // Resetear todos los estados de texto al cambiar de modelo
    setShowNewsText(false);
    setShowIndicadoresText(false);
    setShowEconomyText(false);
    setShowContaminationText(false);
    setShowTourismText(false);
    setShowProjectsText(false);
    setShowPueblosText(false);
    setShowDeportesText(false);
    setShowMusicaText(false);
    setShowGaleriaText(false);
    setShowBibliotecaText(false);
    setShowCineText(false);
    
    // Resetear el estado del modal si está abierto
    if (activeModal.isOpen) {
      setActiveModal({
        isOpen: false,
        content: '',
        title: ''
      });
    }
    
    // Primero cambiamos el modelo
    setCurrentModel(newModel);
    
    // Esperamos a que el modelo esté cargado
    const checkModelLoaded = setInterval(() => {
      if (newModel === 'acuario' && acuarioRef.current) {
        clearInterval(checkModelLoaded);
        acuarioRef.current.goToNext();
        
        // Esperamos a que la cámara esté en posición
        setTimeout(() => {
          setIsTransitioning(false);
          setShowUIElements(true);
          setShowLobbyText(true);
          
          // Ocultamos el texto de lobby después de 2 segundos
          setTimeout(() => {
            setShowLobbyText(false);
          }, 2000);
        }, 1000);
      } else if (newModel === 'invernadero' && invernaderoRef.current) {
        clearInterval(checkModelLoaded);
        
        // Movemos la cámara a la posición default
        invernaderoRef.current.moveToDefault();
        
        // Esperamos a que la cámara esté en posición
        setTimeout(() => {
          setIsTransitioning(false);
          setShowUIElements(true);
          setShowLobbyText(true);
          
          // Ocultamos el texto de lobby después de 2 segundos
          setTimeout(() => {
            setShowLobbyText(false);
          }, 2000);
        }, 1000);
      } else if (modelRef.current && typeof (modelRef.current as any).moveToDefault === 'function' && newModel !== 'invernadero' && newModel !== 'acuario') {
        clearInterval(checkModelLoaded);
        
        // Movemos la cámara a la posición default
        (modelRef.current as any).moveToDefault();
        
        // Esperamos a que la cámara esté en posición
        setTimeout(() => {
          // Forzamos una interacción inicial para posicionar los botones sin mostrar el mapa
          setShowMap(true);
          
          // Cerramos el mapa inmediatamente
          setTimeout(() => {
            setShowMap(false);
            
            // Después de que el mapa se cierre, mostramos la UI y el texto
            setTimeout(() => {
              setIsTransitioning(false);
              setShowUIElements(true);
              setShowLobbyText(true);
              
              // Ocultamos el texto de lobby después de 2 segundos
              setTimeout(() => {
                setShowLobbyText(false);
              }, 2000);
            }, 100);
          }, 100);
        }, 1000);
      }
    }, 100);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000', position: 'relative' }}>
      {error && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff4444',
          fontSize: '18px',
          textAlign: 'center',
          maxWidth: '80%',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px'
        }}>
          {error}
          <br />
          <small style={{ color: '#ffffff' }}>
            Expected path: /dracoFlora/proyecto.glb
            <br />
            Make sure the model file is in the public/dracoFlora folder
          </small>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, backgroundColor: '#000000' }}
        animate={{ 
          opacity: isModelLoaded && !isTransitioning ? 1 : 0,
          backgroundColor: isModelLoaded && !isTransitioning ? 'transparent' : '#000000'
        }}
        transition={{ 
          duration: 1.5,
          ease: "easeInOut",
          backgroundColor: {
            duration: 2,
            ease: "easeInOut"
          }
        }}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          background: isModelLoaded && !isTransitioning ? 'transparent' : '#000000'
        }}
      >
        <Canvas
          camera={{ 
            position: [5.98, -0.59, -0.40],
            fov: 50,
            rotation: [
              THREE.MathUtils.degToRad(124.14),
              THREE.MathUtils.degToRad(88.31),
              THREE.MathUtils.degToRad(33.7)
            ]
          }}
          style={{ background: '#000000' }}
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
            shadowMapType: THREE.PCFSoftShadowMap,
            shadowMapEnabled: true
          }}
        >
          <Suspense fallback={null}>
            <ErrorBoundary onError={(error) => console.error(error)}>
              <Scene 
                showControls={currentModel === 'invernadero'}
                onCameraPositionChange={setCameraPosition}
                onViewChange={handleViewChange}
                modelRef={modelRef}
                acuarioRef={acuarioRef}
                invernaderoRef={invernaderoRef}
                currentModel={currentModel}
                showMap={showMap}
                onShowNews={(show) => setShowNewsText(show)}
                onShowIndicadores={(show) => setShowIndicadoresText(show)}
                onShowEconomy={(show) => setShowEconomyText(show)}
                onShowContamination={(show) => setShowContaminationText(show)}
                onShowTourism={(show) => setShowTourismText(show)}
                onShowProjects={(show) => setShowProjectsText(show)}
                onShowPueblos={(show) => setShowPueblosText(show)}
                onShowGaleria={(show) => setShowGaleriaText(show)}
                isInitialLoad={isInitialLoad}
                showLobbyText={showLobbyText}
                activeText={activeText}
                setActiveText={setActiveText}
                setShowIndicadoresText={setShowIndicadoresText}
                setShowNewsText={setShowNewsText}
                setShowEconomyText={setShowEconomyText}
                setShowContaminationText={setShowContaminationText}
                setShowTourismText={setShowTourismText}
                setShowProjectsText={setShowProjectsText}
                setShowPueblosText={setShowPueblosText}
                setShowDeportesText={setShowDeportesText}
                setShowMusicaText={setShowMusicaText}
                setShowGaleriaText={setShowGaleriaText}
                setShowBibliotecaText={setShowBibliotecaText}
                setShowCineText={setShowCineText}
                openModal={openModal}
              />
              <CameraController onModelChange={setCurrentModel} />
            </ErrorBoundary>
          </Suspense>
        </Canvas>
      </motion.div>

      {!isModelLoaded && <LoadingOverlay isPreloading={isPreloading} preloadProgress={preloadProgress} />}

      <AnimatePresence mode="sync">
        {getVisibleArrows().map((arrow, index) => (
          <NavigationArrow
            key={`${arrow.position}-${arrow.direction}`}
            position={arrow.position}
            direction={arrow.direction}
            onClick={arrow.onClick}
          />
        ))}
      </AnimatePresence>

      {isModelLoaded && !isInitialLoad && showUIElements && (
        <>
          <AnimatePresence>
            {showLobbyText && currentModel !== 'acuario' && currentModel !== 'invernadero' && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.25, 0.8, 0.25, 1]
                }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: currentModel === 'default' ? '43%' : 
                         currentModel === 'guayana' ? '35%' :
                         currentModel === 'cultura' ? '40%' : '35%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontSize: '4rem',
                  fontWeight: '400',
                  fontFamily: '"Anton", sans-serif',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
              >
                {currentModel === 'default' ? 'LOBBY' : 
                 currentModel === 'guayana' ? 'REGION GUAYANA' :
                 currentModel === 'cultura' ? 'CULTURA' : ''}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agregar el nuevo componente para acuario e invernadero */}
          <SpecialModelText 
            show={showLobbyText && (currentModel === 'acuario' || currentModel === 'invernadero')} 
            model={currentModel as 'acuario' | 'invernadero'} 
          />

          {/* Botones del mapa y explorar */}
          <div style={{
            position: 'fixed',
            top: '87.5vh',
            left: '48.5vw',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '20px',
            zIndex: 1000,
            transition: 'all 0.5s ease'
          }}>
            <motion.button
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: 1, 
                opacity: 1
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                scaleX: {
                  duration: 0.5,
                  ease: "easeOut"
                }
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.3s ease, transform 0.3s ease',
                fontSize: '1rem',
                position: 'relative',
                willChange: 'transform',
                transformOrigin: 'center'
              }}
              onClick={() => setShowMap(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <TypingText text="Ver Mapa" />
            </motion.button>

            <AnimatePresence mode="wait">
              {currentView !== 'default' && !(currentModel === 'default' && currentView === 'wall3') && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  onClick={() => {
                    // Determinar el título basado en el modelo y la vista actual
                    let titulo = '';
                    let contenido = '';
                    
                    if (currentModel === 'default') {
                      switch (currentView) {
                        case 'wall1':
                          titulo = 'Indicadores';
                          contenido = '/html/indicadores.html';
                          break;
                        case 'wall2':
                          titulo = 'Artículos';
                          contenido = '/html/listarticulos.html';
                          break;
                      }
                    } else if (currentModel === 'cultura') {
                      switch (currentView) {
                        case 'wall1':
                          titulo = 'Deportes';
                          contenido = '/html/deporte.html';
                          break;
                        case 'wall2':
                          titulo = 'Música';
                          contenido = '/html/musica.html';
                          break;
                        case 'wall3':
                          setActiveModal({
                            isOpen: true,
                            content: '',
                            title: 'Galería'
                          });
                          return;
                        case 'wall4':
                          titulo = 'Biblioteca';
                          contenido = '/html/listalibrosyleyendas.html';
                          break;
                        case 'wall5':
                          titulo = 'Cine';
                          contenido = '/html/peliculas.html';
                          break;
                      }
                    } else if (currentModel === 'guayana') {
                      switch (currentView) {
                        case 'wall1':
                          titulo = 'Economía';
                          contenido = '/html/listaarticulosEconomia.html';
                          break;
                        case 'wall2':
                          titulo = 'Nuestros Pueblos';
                          contenido = '/html/indigenas.html';
                          break;
                        case 'wall3':
                          titulo = 'Turismo';
                          contenido = '/html/turismo.html';
                          break;
                        case 'wall4':
                          titulo = 'Proyectos';
                          contenido = '/html/proyectos.html';
                          break;
                        case 'wall5':
                          titulo = 'Contaminación';
                          contenido = '/html/listaarticulosContaminacion.html';
                          break;
                      }
                    }
                    
                    if (contenido) {
                      openModal(contenido, titulo);
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: '1px solid white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease, transform 0.3s ease',
                    fontSize: '1rem',
                    willChange: 'transform, opacity'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <TypingText text="Explorar" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <Mapa 
            isOpen={showMap} 
            onClose={() => setShowMap(false)} 
            onButtonClick={() => {
              setShowMap(false);
              handleModelChange('guayana');
            }}
            onButton0Click={() => {
              setShowMap(false);
              handleModelChange('default');
            }}
            onButton2Click={() => {
              setShowMap(false);
              handleModelChange('acuario');
            }}
            onButton3Click={() => {
              setShowMap(false);
              handleModelChange('invernadero');
            }}
            onButton4Click={() => {
              setShowMap(false);
              handleModelChange('cultura');
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.95)'
            }}
          />
          
          <Modal
            isOpen={activeModal.isOpen && !(currentModel === 'cultura' && currentView === 'wall3' && activeModal.title === 'Galería')}
            onClose={closeModal}
            htmlContent={activeModal.content}
            title={activeModal.title}
          />

          <Galeria 
            show={activeModal.isOpen && currentModel === 'cultura' && currentView === 'wall3' && activeModal.title === 'Galería'} 
            onClose={closeModal}
          />

          {!isInitialLoad && !showLobbyText && currentView !== 'default' && (
            <>
              <NewsTextAnimation 
                isVisible={activeText === 'noticias'} 
                text="Noticias Recientes" 
                position="75%" 
              />
              <NewsTextAnimation 
                isVisible={activeText === 'indicadores'} 
                text="Indicadores" 
                position="75%" 
                customStyle={{
                  left: '40%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '3rem',
                  letterSpacing: '2px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              />
              {currentModel === 'guayana' && (
                <>
                  <NewsTextAnimation 
                    isVisible={activeText === 'economia'} 
                    text="ECONOMÍA" 
                    position="75%" 
                    customStyle={{
                      left: '42%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'pueblos'} 
                    text="NUESTROS PUEBLOS" 
                    position="75%" 
                    customStyle={{
                      left: '37%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'turismo'} 
                    text="TURISMO" 
                    position="75%" 
                    customStyle={{
                      left: '42%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'proyectos'} 
                    text="PROYECTOS Y CONTAMINACIÓN" 
                    position="75%" 
                    customStyle={{
                      left: '32.5%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'contaminacion'} 
                    text="PROYECTOS Y CONTAMINACIÓN" 
                    position="75%" 
                    customStyle={{
                      left: '31.5%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                </>
              )}
              {currentModel === 'cultura' && (
                <>
                  <NewsTextAnimation 
                    isVisible={activeText === 'deportes'} 
                    text="DEPORTES" 
                    position="75%" 
                    customStyle={{
                      left: '42%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'musica'} 
                    text="MÚSICA" 
                    position="75%" 
                    customStyle={{
                      left: '43%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'galeria' && !(activeModal.isOpen && currentModel === 'cultura' && currentView === 'wall3' && activeModal.title === 'Galería')} 
                    text="GALERÍA" 
                    position="75%" 
                    customStyle={{
                      left: '42%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'biblioteca'} 
                    text="BIBLIOTECA" 
                    position="75%" 
                    customStyle={{
                      left: '41%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <NewsTextAnimation 
                    isVisible={activeText === 'cine'} 
                    text="CINE" 
                    position="75%" 
                    customStyle={{
                      left: '45.5%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '3rem',
                      letterSpacing: '2px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Pantalla de carga para transiciones */}
      {isTransitioning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          gap: '20px'
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="/logo-museo.png" 
              alt="Logo Museo"
              style={{
                width: '400px',
                height: 'auto',
                marginBottom: '2px'
              }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              color: '#ffffff',
              fontSize: '24px',
              fontFamily: '"Anton", sans-serif',
              letterSpacing: '2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{
              fontSize: '20px',
              opacity: 0.8
            }}>
              Cargando...
            </div>
            <div style={{
              width: '200px',
              height: '2px',
              background: 'rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '1px'
            }}>
              <motion.div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  position: 'absolute',
                  left: 0,
                  transformOrigin: '0%',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      )}

      <style>
        {`          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -30%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </div>
  );
}
export default ModelViewer; 

