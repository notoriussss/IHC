import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PueblosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PueblosModal: React.FC<PueblosModalProps> = ({ isOpen, onClose }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Cerrar modal con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              width: '90%',
              height: '90%',
              backgroundColor: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!iframeLoaded && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#0E6CC4',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                Cargando...
              </div>
            )}
            
            <iframe
              src="/html/indigenas.html"
              title="Pueblos Indígenas de la Región Guayana"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: iframeLoaded ? 'block' : 'none'
              }}
              onLoad={() => setIframeLoaded(true)}
            />
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PueblosModal; 