import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Invernadero, { InvernaderoRef } from './Invernadero';

interface InvernaderoViewerProps {
  onViewChange?: (view: string) => void;
  showMap?: boolean;
}

const InvernaderoViewer: React.FC<InvernaderoViewerProps> = ({ onViewChange, showMap }) => {
  const modelRef = useRef<InvernaderoRef>(null);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [5, 2, 5], fov: 50 }}
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
          files="/hdri/sunset.hdr"
          background={false}
          blur={0.5}
        />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.3}
          scale={10}
          blur={2.5}
          far={4}
        />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          target={[0, 0, 0]}
        />
        
        <Invernadero ref={modelRef} />
      </Canvas>
    </div>
  );
};

export default InvernaderoViewer; 