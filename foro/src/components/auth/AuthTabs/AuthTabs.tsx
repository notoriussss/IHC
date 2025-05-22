import React from 'react';
import './AuthTabs.css';
import AuthForm from '../AuthForm';

interface AuthTabsProps {
  onSuccess?: () => void;
  mode: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ onSuccess, mode = 'login', onModeChange }) => {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => onModeChange?.('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => onModeChange?.('register')}
          >
            Registrarse
          </button>
        </div>
      </div>
      <AuthForm mode={mode} onSuccess={onSuccess} />
    </div>
  );
};

export default AuthTabs; 