import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { useGLTF, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import AnimalCarousel3D, { AnimalCarouselHandles, AnimalCarousel } from './AnimalCarousel';
import '../styles/Carousel.css';

export interface AcuarioModelHandles {
  goToNext: () => void;
  goToPrev: () => void;
  getCurrentView: () => 'default';
}

interface AcuarioModelProps {
  isActive: boolean;
  showMap?: boolean;
  bt2Active?: boolean;
  onViewChange?: (view: 'default') => void;
  carouselRef?: React.RefObject<AnimalCarouselHandles | null>;
}

const AcuarioModel = forwardRef<AcuarioModelHandles, AcuarioModelProps>(({ isActive, showMap = false, bt2Active = false, onViewChange, carouselRef }, ref) => {
  const modelRef = useRef<THREE.Group | null>(null);
  const { scene } = useGLTF('/dracoFlora/acuario-final.glb');
  const { camera } = useThree();
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);
  const [currentQuaternion, setCurrentQuaternion] = useState<THREE.Quaternion | null>(null);
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [targetQuaternion, setTargetQuaternion] = useState<THREE.Quaternion | null>(null);

  // Inicialización del modelo y la cámara
  useEffect(() => {
    if (isActive) {
      // Aplicar rotación al modelo
      if (modelRef.current) {
        modelRef.current.rotation.y = 0;
        modelRef.current.position.y = -0.5;
      }
      
      // Establecer posición fija de la cámara inmediatamente
      if (camera instanceof THREE.PerspectiveCamera) {
        // Posición por defecto
        const defaultPosition = new THREE.Vector3(2.09, 0.95, 6.55);
        const defaultRotation = new THREE.Euler(
          THREE.MathUtils.degToRad(-1.74),
          THREE.MathUtils.degToRad(0.54),
          THREE.MathUtils.degToRad(0.02)
        );
        const defaultQuaternion = new THREE.Quaternion().setFromEuler(defaultRotation);

        // Aplicar posición y rotación inmediatamente
        camera.position.copy(defaultPosition);
        camera.quaternion.copy(defaultQuaternion);
        camera.updateProjectionMatrix();

        // Actualizar estados para mantener la posición
        setCurrentPosition(defaultPosition.clone());
        setCurrentQuaternion(defaultQuaternion.clone());
        setTargetPosition(defaultPosition.clone());
        setTargetQuaternion(defaultQuaternion.clone());
      }
    }
  }, [camera, isActive]);

  // Mantener la cámara fija en su posición inicial
  useFrame(() => {
    if (camera instanceof THREE.PerspectiveCamera && isActive) {
      camera.position.set(2.09, 0.95, 6.55);
      const rotation = new THREE.Euler(
        THREE.MathUtils.degToRad(-1.74),
        THREE.MathUtils.degToRad(0.54),
        THREE.MathUtils.degToRad(0.02)
      );
      camera.quaternion.setFromEuler(rotation);
      camera.updateProjectionMatrix();
    }
  });

  // Exponer las funciones al componente padre
  useImperativeHandle(ref, () => ({
    goToNext: () => {
      if (carouselRef && carouselRef.current && carouselRef.current.goToNext) {
        carouselRef.current.goToNext();
      }
    },
    goToPrev: () => {
      if (carouselRef && carouselRef.current && carouselRef.current.goToPrev) {
        carouselRef.current.goToPrev();
      }
    },
    getCurrentView: () => 'default'
  }));

  if (!isActive) return null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <primitive 
        ref={modelRef}
        object={scene} 
        scale={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        target={[0, 0, 0]}
      />
      
      {/* Integramos el carrusel dentro del modelo 3D */}
      <group 
        position={[
          showMap ? -100 : -0.4,
          0.5,
          -1
        ]} 
        rotation={[-0.08, 0.305, 0.025]}
      >
        <Html
          position={[0.1, 0, 1]} 
          center
          distanceFactor={2.3}
          transform
          occlude={false}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'all',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            width: '600px',
            height: 'auto',
            padding: '20px',
            borderRadius: '25px',
            position: 'relative',
            zIndex: 1
          }}>
            <AnimalCarousel ref={carouselRef} />
          </div>
        </Html>
      </group>
    </>
  );
});

export default AcuarioModel;