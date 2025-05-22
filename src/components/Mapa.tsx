import React, { CSSProperties } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mapa de Ubicaciones"
      style={style}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
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
                  src="/iconos/bt5.svg"
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={() => window.location.href = 'http://localhost:5173/'}
                  alt="Botón 5"
                />
                <img
                  src="/iconos/bt4.svg"
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButton4Click}
                  alt="Botón 4"
                />
                <img
                  src="/iconos/bt3.svg"
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButton3Click}
                  alt="Botón 3"
                />
              </div>
              <div style={rowStyle}>
                <img
                  src="/iconos/bt2.svg"
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButton2Click}
                  alt="Botón 2"
                />
                <img
                  src="/iconos/bt1.svg"
                  style={{ ...imageStyle, filter: 'brightness(1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onClick={onButtonClick}
                  alt="Botón 1"
                />
                <img
                  src="/iconos/bt0.svg"
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