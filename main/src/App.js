import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import LanzaGuisante from './components/LanzaGuisante';

// Flecha indicadora fija en pantalla con dirección
function ArrowIndicator({ position, direction, onClick }) {
  const getPositionStyle = () => {
    switch (position) {
      case 'left':
        return { left: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { right: '20px', top: '50%', transform: 'translateY(-50%)' };
      case 'top':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      default:
        return {};
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

  const baseStyle = getPositionStyle();
  const rotation = getRotation();

  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        ...baseStyle,
        width: '60px',
        height: '60px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
        transition: 'all 0.3s ease',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '50%',
        padding: '10px',
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = `${baseStyle.transform} scale(1.2)`;
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.9';
        e.currentTarget.style.transform = baseStyle.transform;
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
      }}
    >
      <div style={{ 
        transform: `rotate(${rotation}deg)`,
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
    </div>
  );
}

// Botón 3D circular
function CircularButton({ position, onClick, label }) {
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

// Controlador de cámara
function CameraController({ targetPosition, lookAtPosition }) {
  const controlsRef = useRef();
  const camera = useThree((state) => state.camera);
  const [position, setPosition] = useState(targetPosition);
  const [currentLookAt, setCurrentLookAt] = useState(lookAtPosition);
  const [targetQuaternion, setTargetQuaternion] = useState(new THREE.Quaternion());
  const [currentQuaternion, setCurrentQuaternion] = useState(new THREE.Quaternion());

  useEffect(() => {
    const direction = new THREE.Vector3(
      lookAtPosition[0] - targetPosition[0],
      lookAtPosition[1] - targetPosition[1],
      lookAtPosition[2] - targetPosition[2]
    ).normalize();

    const targetQuat = new THREE.Quaternion();
    targetQuat.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);
    setTargetQuaternion(targetQuat);
  }, [lookAtPosition, targetPosition]);

  useFrame(() => {
    const newPosition = [
      position[0] + (targetPosition[0] - position[0]) * 0.05,
      position[1] + (targetPosition[1] - position[1]) * 0.05,
      position[2] + (targetPosition[2] - position[2]) * 0.05,
    ];

    const newLookAt = [
      currentLookAt[0] + (lookAtPosition[0] - currentLookAt[0]) * 0.05,
      currentLookAt[1] + (lookAtPosition[1] - currentLookAt[1]) * 0.05,
      currentLookAt[2] + (lookAtPosition[2] - currentLookAt[2]) * 0.05,
    ];

    currentQuaternion.slerp(targetQuaternion, 0.05);
    setCurrentQuaternion(currentQuaternion.clone());

    setPosition(newPosition);
    setCurrentLookAt(newLookAt);

    camera.position.set(...newPosition);
    camera.quaternion.copy(currentQuaternion);
    controlsRef.current.target.set(...newLookAt);
    controlsRef.current.update();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={position} />
      <OrbitControls 
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={10}
      />
    </>
  );
}

// App principal
function App() {
  const [targetPosition, setTargetPosition] = useState([2, 0.8, 0.080]);
  const [lookAtPosition, setLookAtPosition] = useState([-0.624, 0.8, 0.084]);
  const [currentView, setCurrentView] = useState('default');

  const defaulttoCamara = () => {
    setTargetPosition([2, 0.8, 0.080]);
    setLookAtPosition([-0.624, 0.8, 0.084]);
    setCurrentView('default');
  };

  const switchToCamera1 = () => {
    setTargetPosition([1, 0.8, 0.080]);
    setLookAtPosition([-0.624, 0.8, 0.084]);
    setCurrentView('cam1');
  };

  const switchToCamera2 = () => {
    setTargetPosition([1.050, 0.8, 0.21]);
    setLookAtPosition([-0.24, 0.8, -1.24]);
    setCurrentView('cam2');
  };

  const switchToCamera3 = () => {
    setTargetPosition([1.050, 0.8, 0.21]);
    setLookAtPosition([-0.037, 0.8, 1.42]);
    setCurrentView('cam3');
  };

  const getVisibleArrows = () => {
    if (currentView === 'default') return [];

    const arrows = [];

    // Flecha para volver a default
    arrows.push({
      position: 'bottom',
      direction: 'right',
      onClick: defaulttoCamara
    });

    switch (currentView) {
      case 'cam1':
        // Desde el centro, flechas a derecha e izquierda
        arrows.push(
          {
            position: 'right',
            direction: 'up',
            onClick: switchToCamera2
          },
          {
            position: 'left',
            direction: 'down',
            onClick: switchToCamera3
          }
        );
        break;
      case 'cam2':
        // Desde la derecha, flecha al centro
        arrows.push({
          position: 'left',
          direction: 'down',
          onClick: switchToCamera1
        });
        break;
      case 'cam3':
        // Desde la izquierda, flecha al centro
        arrows.push({
          position: 'right',
          direction: 'up',
          onClick: switchToCamera1
        });
        break;
    }

    return arrows;
  };

  return (
    <>
      <Canvas style={{ height: '100vh' }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <CameraController targetPosition={targetPosition} lookAtPosition={lookAtPosition} />
        <LanzaGuisante />

        {currentView === 'default' && (
          <>
            <CircularButton position={[-0.624, 0.8, 0.084]} onClick={switchToCamera1} label="Cam 1" />
            <CircularButton position={[-0.24, 0.8, -1.24]} onClick={switchToCamera2} label="Cam 2" />
            <CircularButton position={[-0.037, 0.8, 1.42]} onClick={switchToCamera3} label="Cam 3" />
          </>
        )}
      </Canvas>

      {getVisibleArrows().map((arrow, index) => (
        <ArrowIndicator
          key={index}
          position={arrow.position}
          direction={arrow.direction}
          onClick={arrow.onClick}
        />
      ))}
    </>
  );
}

export default App;
