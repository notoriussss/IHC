import React from 'react';
import { Html } from '@react-three/drei';

interface PulsingButtonProps {
  position: [number, number, number];
  onClick: () => void;
  label: string;
}

const PulsingButton: React.FC<PulsingButtonProps> = ({ position, onClick, label }) => {
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
};

export default PulsingButton; 