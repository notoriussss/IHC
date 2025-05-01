import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import LanzaGuisante from './components/LanzaGuisante';

function CameraController({ targetPosition, lookAtPosition }) {
  const controlsRef = useRef();
  const camera = useThree((state) => state.camera);
  const [position, setPosition] = useState(targetPosition);

  // Interpolar la posición de la cámara suavemente si la posición objetivo cambia
  useFrame(() => {
    const newPosition = [
      position[0] + (targetPosition[0] - position[0]) * 0.1,
      position[1] + (targetPosition[1] - position[1]) * 0.1,
      position[2] + (targetPosition[2] - position[2]) * 0.1,
    ];

    setPosition(newPosition);

    // Actualizar la posición de la cámara y hacer que los controles miren a lookAtPosition
    camera.position.set(...newPosition);
    controlsRef.current.target.set(...lookAtPosition);
    controlsRef.current.update();
  });

  // Cuando cambies manualmente la cámara con los controles, actualizar posición para mantener sincronización si quieres, o eliminar para solo control por botones
  // Aquí permitimos que el usuario controle sin forzar posición, solo movemos cámara cuando cambias objetivo por botones

  return (
    <>
      <PerspectiveCamera makeDefault position={position} />
      <OrbitControls ref={controlsRef} />
    </>
  );
}

function App() {
  const [targetPosition, setTargetPosition] = useState([2, 0.8, 0.080]);
  const [lookAtPosition, setLookAtPosition] = useState([-0.624, 0.8, 0.084]);

  const defaulttoCamara = () => {
    setTargetPosition([2, 0.8, 0.080]);
    setLookAtPosition([-0.624, 0.8, 0.084]);
  };

  const switchToCamera1 = () => {
    setTargetPosition([1, 0.8, 0.080]);
    setLookAtPosition([-0.624, 0.8, 0.084]);
  };

  const switchToCamera2 = () => {
    setTargetPosition([1.050, 0.8, 0.21]);
    setLookAtPosition([-0.24, 0.8, -1.24]);
  };

  const switchToCamera3 = () => {
    setTargetPosition([1.050, 0.8, 0.21]);
    setLookAtPosition([-0.037, 0.8, 1.42]);
  };

  return (
    <>
      <Canvas style={{ height: '100vh' }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <CameraController targetPosition={targetPosition} lookAtPosition={lookAtPosition} />
        <LanzaGuisante />
      </Canvas>
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button onClick={defaulttoCamara}>default</button>
        <button onClick={switchToCamera1}>camara 1</button>
        <button onClick={switchToCamera2}>Cámara 2 (mira derecha)</button>
        <button onClick={switchToCamera3}>Cámara 3 (mira izquierda)</button>
      </div>
    </>
  );
}

export default App;