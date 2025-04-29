import React from 'react';
import { Canvas } from '@react-three/fiber';
import LanzaGuisante from './components/LanzaGuisante';

function App() {
  return (
    <Canvas style={{ height: '100vh' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <LanzaGuisante />
    </Canvas>
  );
}

export default App;
