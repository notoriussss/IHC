import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const [error, setError] = useState<string | null>(null);
  const gltf = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    try {
      if (modelRef.current && camera instanceof THREE.PerspectiveCamera) {
        // Center the model
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const center = box.getCenter(new THREE.Vector3());
        modelRef.current.position.sub(center);

        // Adjust camera to fit model
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
        camera.position.z = cameraZ * 1.5; // Reduced multiplier for closer view
        camera.updateProjectionMatrix();
      }
    } catch (e) {
      setError(`Error processing model: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [gltf, camera]);

  if (error) {
    return null;
  }

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

function LoadingOverlay() {
  const { progress } = useProgress();
  return progress < 100 ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      color: '#ffffff',
      fontSize: '24px',
      textAlign: 'center'
    }}>
      Loading Model... {progress.toFixed(0)}%
    </div>
  ) : null;
}

function CameraPosition({ onPositionChange }: { onPositionChange: (pos: { x: number, y: number, z: number }) => void }) {
  const { camera } = useThree();

  useFrame(() => {
    onPositionChange({
      x: Number(camera.position.x.toFixed(2)),
      y: Number(camera.position.y.toFixed(2)),
      z: Number(camera.position.z.toFixed(2))
    });
  });

  return null;
}

function Scene({ showControls, onCameraPositionChange }: { showControls: boolean, onCameraPositionChange: (pos: { x: number, y: number, z: number }) => void }) {
  const [error, setError] = useState<string | null>(null);
  const { camera, scene } = useThree();

  useEffect(() => {
    camera.position.set(0.06, 0.21, 1.06);
    camera.updateProjectionMatrix();

    // Analizar objetos en la escena
    const objects = scene.children;
    console.log('Objetos en la escena:', objects);
    
    // Crear un raycaster para detectar objetos frente a la cámara
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log('Objetos frente a la cámara:', intersects);
  }, [camera, scene]);

  return (
    <>
      <ErrorBoundary onError={(error) => setError(error.message)}>
        <Model url="/dracoFlora/floraOBJ.glb" />
      </ErrorBoundary>
      
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {showControls && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.1}
          maxDistance={1000}
          minPolarAngle={0}
          maxPolarAngle={Math.PI * 2}
          dampingFactor={0.05}
          makeDefault
          target={[0, 0, 0]}
        />
      )}
      <CameraPosition onPositionChange={onCameraPositionChange} />
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

export default function ModelViewer() {
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [cameraPosition, setCameraPosition] = useState({ x: 0.06, y: 0.21, z: 1.06 });

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a', position: 'relative' }}>
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
            Expected path: /dracoFlora/floraOBJ.glb
            <br />
            Make sure all model files and textures are in the public/dracoFlora folder
          </small>
        </div>
      )}
      
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        zIndex: 1000
      }}>
        Camera Position:
        <div>X: {cameraPosition.x}</div>
        <div>Y: {cameraPosition.y}</div>
        <div>Z: {cameraPosition.z}</div>
      </div>
      
      <Canvas
        camera={{ position: [0.06, 0.21, 1.06], fov: 45 }}
        style={{ background: '#1a1a1a' }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          shadowMapType: THREE.PCFSoftShadowMap
        }}
      >
        <Suspense fallback={null}>
          <Scene 
            showControls={showControls} 
            onCameraPositionChange={setCameraPosition}
          />
        </Suspense>
      </Canvas>

      <LoadingOverlay />
      
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white'
      }}>
        <button
          onClick={() => setShowControls(!showControls)}
          style={{
            background: '#333',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
      </div>
    </div>
  );
} 