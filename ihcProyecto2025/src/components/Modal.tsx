import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const modalOverlayStyle: React.CSSProperties = {
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
  backdropFilter: 'blur(3px)'
};

const modalStyle: React.CSSProperties = {
  background: 'white',
  padding: '10px',
  borderRadius: '20px',
  width: '80%',
  maxWidth: '1200px',
  height: '600px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '24px',
  color: '#333'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.1)',
  border: 'none',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#666',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  right: '15px',
  top: '15px',
  zIndex: 1,
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: 0,
  lineHeight: '1',
  fontWeight: 'bold'
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  padding: '5px'
};

const modalVariants = {
  hidden: {
    y: '100%',
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  }
};

const overlayVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, htmlContent, children, style }) => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (isOpen && htmlContent) {
      // Cargar el contenido HTML
      fetch(htmlContent)
        .then(response => response.text())
        .then(html => {
          setContent(html);
        })
        .catch(error => {
          console.error('Error loading modal content:', error);
        });
    }
  }, [isOpen, htmlContent]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          style={{...modalOverlayStyle, ...style}}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={modalStyle}
          >
            <button 
              onClick={onClose} 
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.color = '#666';
              }}
            >
              ×
            </button>
            <div style={contentStyle}>
              {htmlContent && htmlContent.length > 0 ? (
                <iframe
                  src={htmlContent}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    overflow: 'auto'
                  }}
                  title={title}
                />
              ) : (
                children
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 