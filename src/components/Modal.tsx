import React, { useEffect, useState } from 'react';

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
  zIndex: 9999
};

const modalStyle: React.CSSProperties = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '80%',
  maxWidth: '1200px',
  height: '600px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column'
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
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  padding: '5px 10px',
  color: '#666',
  transition: 'color 0.3s ease'
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto'
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

  if (!isOpen) return null;

  return (
    <div style={{...modalOverlayStyle, ...style}}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>
        <div style={contentStyle}>
          {htmlContent && htmlContent.length > 0 ? (
            <iframe
              src={htmlContent}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={title}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 