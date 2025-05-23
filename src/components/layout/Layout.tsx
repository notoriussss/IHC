import React, { useState, ReactNode } from 'react';
import { useAuth } from '../../context';
import AuthForm from '../auth/AuthForm';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="layout">
      <header className="header">
        <h1>Mi Foro</h1>
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Bienvenido, {user?.username}</span>
              <button onClick={logout} className="auth-button">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="auth-button"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="auth-button"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>
            <AuthForm
              mode={authMode}
              onSuccess={handleAuthSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
