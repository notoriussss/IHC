import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import LanzaGuisante from './components/LanzaGuisante';

function CameraController({ targetPosition }) {
  const [cameraPosition, setCameraPosition] = useState([0, 0, 8]); // Posición inicial de la cámara

  // Interpolar la posición de la cámara
  useFrame(() => {
    setCameraPosition((prevPosition) => {
      const newPosition = [
        prevPosition[0] + (targetPosition[0] - prevPosition[0]) * 0.1,
        prevPosition[1] + (targetPosition[1] - prevPosition[1]) * 0.1,
        prevPosition[2] + (targetPosition[2] - prevPosition[2]) * 0.1,
      ];
      return newPosition;
    });
  });

  return <PerspectiveCamera makeDefault position={cameraPosition} />;
}

function App() {
  const [targetPosition, setTargetPosition] = useState([0, 10, 8]); // Posición inicial de la cámara

  const switchToCamera1 = () => {
    setTargetPosition([0, 10, 8]); // Posición de la cámara 1
  };

  const switchToCamera2 = () => {
    setTargetPosition([5, 5, 8]); // Posición de la cámara 2 (desplazada a la derecha)
  };

  const switchToCamera3 = () => {
    setTargetPosition([-5, 5, 8]); // Posición de la cámara 3 (desplazada a la izquierda)
  };

  return (
    <>
      <Canvas style={{ height: '100vh' }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <CameraController targetPosition={targetPosition} />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false}/>
        <LanzaGuisante />
      </Canvas>
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button onClick={switchToCamera1}>Cámara 1</button>
        <button onClick={switchToCamera2}>Cámara 2</button>
        <button onClick={switchToCamera3}>Cámara 3</button>
      </div>
    </>
  );
}

export default App;