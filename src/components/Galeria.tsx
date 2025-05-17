import React, { useEffect, useRef } from 'react';

interface GaleriaProps {
  show: boolean;
  onClose?: () => void;
}

const Galeria: React.FC<GaleriaProps> = ({ show, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Ajustar tamaño cuando se muestra
    if (show && iframeRef.current) {
      iframeRef.current.style.height = '80vh';
    }
  }, [show]);

  if (!show) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '1200px',
        maxHeight: '80vh',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '10px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        <button 
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#444',
          }}
        >
          ×
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src="/html/galeria.html"
        style={{
          width: '100%',
          height: '80vh',
          border: 'none',
        }}
        title="Galería Amazónica"
      />
    </div>
  );
};

export default Galeria; 