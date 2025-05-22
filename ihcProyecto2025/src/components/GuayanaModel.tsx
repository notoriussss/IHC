import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { TypingText } from './TypingText';

// Importar el sonido de hover desde ModelViewer o definirlo aquí si se necesita
// Acceder a la variable global definida en ModelViewer
declare global {
  interface Window {
    hoverSound?: HTMLAudioElement;
  }
}

interface CircularButtonProps {
  position: [number, number, number];
  onClick: () => void;
  label: string;
  tooltip: string;
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

interface GuayanaModelProps {
  onViewChange: (view: string) => void;
  onNavigationChange?: (arrows: Array<{ position: string, direction: string, onClick: () => void }>) => void;
  onShowNews?: (show: boolean) => void;
  onShowEconomy?: (show: boolean) => void;
  onShowContamination?: (show: boolean) => void;
  onShowTourism?: (show: boolean) => void;
  onShowProjects?: (show: boolean) => void;
  onShowPueblos?: (show: boolean) => void;
  showMap?: boolean;
  openModal?: (content: string, title: string) => void;
}

const GuayanaModel = forwardRef<THREE.Group, GuayanaModelProps>(({ onViewChange, onNavigationChange, onShowNews, onShowEconomy, onShowContamination, onShowTourism, onShowProjects, onShowPueblos, showMap, openModal }, ref) => {
  const [error, setError] = useState<string | null>(null);
  const gltf = useGLTF('/dracoFlora/regGuayana.glb');
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
      const newPosition = new THREE.Vector3(4.73, -0.08, 0.31);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-114.56),
        THREE.MathUtils.degToRad(85.48),
        THREE.MathUtils.degToRad(114.63)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('default');
      onViewChange('default');
      if (onShowNews) onShowNews(false);
      if (onShowEconomy) onShowEconomy(false);
      if (onShowContamination) onShowContamination(false);
      if (onShowTourism) onShowTourism(false);
      if (onShowProjects) onShowProjects(false);
      if (onShowPueblos) onShowPueblos(false);
    }
  };
  

  const moveToWall1 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      console.log('Moving to wall1');
      const newPosition = new THREE.Vector3(1.19, -0.18, 2.25);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-179.60),
        THREE.MathUtils.degToRad(41.03),
        THREE.MathUtils.degToRad(179.74)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall1');
      onViewChange('wall1');
      if (onShowEconomy) onShowEconomy(true);
      if (onShowNews) onShowNews(false);
    }
  };

  const moveToWall2 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(-0.21, -0.31, 1.03);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(179.29),
        THREE.MathUtils.degToRad(48.03),
        THREE.MathUtils.degToRad(-179.47)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall2');
      onViewChange('wall2');
      if (onShowPueblos) onShowPueblos(true);
      if (onShowNews) onShowNews(false);
      if (onShowEconomy) onShowEconomy(false);
    }
  };

  const moveToWall3 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(-0.25, -0.41, -0.28);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(5.49),
        THREE.MathUtils.degToRad(46.21),
        THREE.MathUtils.degToRad(-3.97)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall3');
      onViewChange('wall3');
      if (onShowTourism) onShowTourism(true);
      if (onShowNews) onShowNews(false);
      if (onShowEconomy) onShowEconomy(false);
      if (onShowContamination) onShowContamination(false);
    }
  };

  const moveToWall4 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(0.25, -0.84, -1.75);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(5.90),
        THREE.MathUtils.degToRad(52.04),
        THREE.MathUtils.degToRad(-4.66)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall4');
      onViewChange('wall4');
      if (onShowProjects) onShowProjects(true);
      if (onShowNews) onShowNews(false);
      if (onShowEconomy) onShowEconomy(false);
      if (onShowContamination) onShowContamination(false);
      if (onShowTourism) onShowTourism(false);
    }
  };

  const moveToWall5 = () => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newPosition = new THREE.Vector3(0.94, -0.21, -1.74);
      const newRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(4.85),
        THREE.MathUtils.degToRad(53.25),
        THREE.MathUtils.degToRad(-3.89)
      );
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(newPosition);
      setTargetQuaternion(newQuaternion);
      setCurrentView('wall5');
      onViewChange('wall5');
      if (onShowContamination) onShowContamination(true);
      if (onShowNews) onShowNews(false);
      if (onShowPueblos) onShowPueblos(false);
      if (onShowTourism) onShowTourism(false);
      if (onShowProjects) onShowProjects(false);
    }
  };

  const moveToView = (view: string, position: THREE.Vector3, rotation: THREE.Euler) => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const newQuaternion = new THREE.Quaternion().setFromEuler(rotation);

      setCurrentPosition(camera.position.clone());
      setCurrentQuaternion(camera.quaternion.clone());
      setTargetPosition(position);
      setTargetQuaternion(newQuaternion);
      setCurrentView(view);
      onViewChange(view);
    }
  };

  const handleShowIndigenasModal = () => {
    if (openModal) {
      openModal('/html/indigenas.html', 'Pueblos Indígenas de la Región Guayana');
    }
  };

  const handleShowEconomiaModal = () => {
    if (openModal) {
      openModal('/html/listaarticulosEconomia.html', 'Economía de la Región Guayana');
    }
  };

  const handleShowTurismoModal = () => {
    if (openModal) {
      openModal('/html/turismo.html', 'Turismo en la Región Guayana');
    }
  };

  const handleShowContaminacionModal = () => {
    if (openModal) {
      openModal('/html/listaarticulosContaminacion.html', 'Contaminación en la Región Guayana');
    }
  };

  // Exponer las funciones de movimiento al componente padre
  useEffect(() => {
    if (ref && 'current' in ref) {
      (ref.current as any).moveToDefault = moveToDefault;
      (ref.current as any).moveToWall1 = moveToWall1;
      (ref.current as any).moveToWall2 = moveToWall2;
      (ref.current as any).moveToWall3 = moveToWall3;
      (ref.current as any).moveToWall4 = moveToWall4;
      (ref.current as any).moveToWall5 = moveToWall5;
    }
  }, [ref, moveToDefault, moveToWall1, moveToWall2, moveToWall3, moveToWall4, moveToWall5]);

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

        // NO establecemos la posición y rotación de la cámara para permitir movimiento libre
        // La cámara mantiene su posición actual
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
      {currentView === 'default' && !showMap && (
        <>
          <CircularButton 
            position={[1.87, 1.58, 1.4]} 
            onClick={() => {
              moveToView('intermediate2', new THREE.Vector3(5, 0.7, 0), new THREE.Euler(
                THREE.MathUtils.degToRad(-45),
                THREE.MathUtils.degToRad(0),
                THREE.MathUtils.degToRad(0)
              ));
              moveToWall2();
            }}
            label="Vista 2"
            tooltip="Nuestros Pueblos"
          />
          <CircularButton 
            position={[-6, 0.17, -7.5]} 
            onClick={() => {
              moveToView('intermediate5', new THREE.Vector3(-2, 0.7, 0), new THREE.Euler(
                THREE.MathUtils.degToRad(-45),
                THREE.MathUtils.degToRad(180),
                THREE.MathUtils.degToRad(0)
              ));
              moveToWall5();
            }}
            label="Vista 5"
            tooltip="Contaminación"
          />
          <CircularButton 
            position={[1.8, 1.33, 3.25]} 
            onClick={() => {
              moveToView('intermediate1', new THREE.Vector3(0, 0.7, 2), new THREE.Euler(
                THREE.MathUtils.degToRad(-45),
                THREE.MathUtils.degToRad(90),
                THREE.MathUtils.degToRad(0)
              ));
              moveToWall1();
            }}
            label="Vista 1"
            tooltip="Economía"
          />
         
          <CircularButton 
            position={[1.78, 1.58, -1.45]} 
            onClick={() => {
              moveToView('intermediate3', new THREE.Vector3(0, 2, 0), new THREE.Euler(
                THREE.MathUtils.degToRad(-90),
                THREE.MathUtils.degToRad(0),
                THREE.MathUtils.degToRad(0)
              ));
              moveToWall3();
            }}
            label="Vista 3"
            tooltip="Turismo"
          />
        </>
      )}
      
      {currentView === 'wall1' && (
        <CircularButton 
          position={[1.3, 0.5, 1]} 
          onClick={handleShowEconomiaModal}
          label="Ver Economía"
          tooltip="Ver Economía"
        />
      )}

      {currentView === 'wall2' && (
        <CircularButton 
          position={[0, 0.3, 0.5]} 
          onClick={handleShowIndigenasModal}
          label="Ver Pueblos Indígenas"
          tooltip="Ver Pueblos Indígenas"
        />
      )}

      {currentView === 'wall3' && (
        <CircularButton 
          position={[0, 0.3, 0.5]} 
          onClick={handleShowTurismoModal}
          label="Ver Turismo"
          tooltip="Ver Turismo"
        />
      )}

      {currentView === 'wall5' && (
        <CircularButton 
          position={[0, 0.3, 0.5]} 
          onClick={handleShowContaminacionModal}
          label="Ver Contaminación"
          tooltip="Ver Contaminación"
        />
      )}

    </group>
  );
});

export default GuayanaModel; 