import React, { CSSProperties, useEffect, useState } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { saveIcon, getIcon } from '../utils/indexedDB';

interface MapaProps {
  isOpen: boolean;
  onClose: () => void;
  onButtonClick: () => void;
  onButton0Click: () => void;
  onButton2Click: () => void;
  onButton3Click: () => void;
  onButton4Click: () => void;
  style?: React.CSSProperties;
}

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle: CSSProperties = {
  padding: '20px',
  width: '800px',
  height: '600px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  border: '31px solid #000',
  borderRadius: '40px',
  background: '#0E6CC4',
  position: 'relative',
  overflow: 'hidden'
};

const closeButtonStyle: CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  padding: '10px 20px',
  borderRadius: '50px',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  width: '150px',
  height: '80px',
  fontSize: '30px'
};

const fondomapa: CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#E6ECFF',
  borderRadius: '22px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px'
};

const imageStyle: CSSProperties = {
  width: '180px',
  height: '180px',
  margin: '10px',
  transition: 'filter 0.3s ease',
};

const imageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px'
};

const rowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px'
};

const buttonStyle: CSSProperties = {
  padding: '10px 20px',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  border: '1px solid white',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const Mapa: React.FC<MapaProps> = ({ isOpen, onClose, onButtonClick, onButton0Click, onButton3Click, onButton2Click, onButton4Click, style }) => {
  const [iconUrls, setIconUrls] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadIcon = async (iconId: string, iconPath: string) => {
    try {
      // Intentar obtener el icono de IndexedDB
      const cachedIcon = await getIcon(iconId);
      
      if (cachedIcon) {
        // Si existe en caché, crear URL del blob
        setIconUrls(prev => ({
          ...prev,
          [iconId]: URL.createObjectURL(cachedIcon)
        }));
      } else {
        // Si no existe, descargarlo y guardarlo
        const response = await fetch(iconPath);
        const blob = await response.blob();
        await saveIcon(iconId, blob);
        setIconUrls(prev => ({
          ...prev,
          [iconId]: URL.createObjectURL(blob)
        }));
      }
    } catch (error) {
      console.error(`Error loading icon ${iconId}:`, error);
      // En caso de error, usar la ruta directa
      setIconUrls(prev => ({
        ...prev,
        [iconId]: iconPath
      }));
    }
  };

  useEffect(() => {
    const loadIcons = async () => {
      setIsLoading(true);
      const iconPaths = [
        { id: 'bt0', path: '/iconos/bt0.svg' },
        { id: 'bt1', path: '/iconos/bt1.svg' },
        { id: 'bt2', path: '/iconos/bt2.svg' },
        { id: 'bt3', path: '/iconos/bt3.svg' },
        { id: 'bt4', path: '/iconos/bt4.svg' },
        { id: 'bt5', path: '/iconos/bt5.svg' }
      ];

      await Promise.all(iconPaths.map(icon => loadIcon(icon.id, icon.path)));
      setIsLoading(false);
    };

    if (isOpen) {
      loadIcons();
    }

    // Limpiar URLs al desmontar
    return () => {
      Object.values(iconUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mapa de Ubicaciones"
      style={style}
    >
      <AnimatePresence mode="wait">
        {isOpen && !isLoading && (
          <motion.div
            key="mapa-content"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ 
              duration: 0.5,
              ease: [0.25, 0.8, 0.25, 1]
            }}
            style={fondomapa}
          >
            <div style={imageContainerStyle}>
              <div style={rowStyle}>
                <img
                  src={iconUrls['bt5'] || '/iconos/bt5.svg'}
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={() => window.location.href = 'https://aqualiaforo.netlify.app'}
                  alt="Botón 5"
                />
                <img
                  src={iconUrls['bt4'] || '/iconos/bt4.svg'}
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButton4Click}
                  alt="Botón 4"
                />
                <img
                  src={iconUrls['bt3'] || '/iconos/bt3.svg'}
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButton3Click}
                  alt="Botón 3"
                />
              </div>
              <div style={rowStyle}>
                <img
                  src={iconUrls['bt2'] || '/iconos/bt2.svg'}
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButton2Click}
                  alt="Botón 2"
                />
                <img
                  src={iconUrls['bt1'] || '/iconos/bt1.svg'}
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButtonClick}
                  alt="Botón 1"
                />
                <img
                  src={iconUrls['bt0'] || '/iconos/bt0.svg'}
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButton0Click}
                  alt="Botón 0"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default Mapa;
