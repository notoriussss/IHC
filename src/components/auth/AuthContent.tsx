import React from 'react';
import AuthTabs from './AuthTabs/AuthTabs';
import './AuthContent.css';

interface AuthContentProps {
  onSuccess: () => void;
  message?: string;
  mode: 'login' | 'register';
}

const AuthContent: React.FC<AuthContentProps> = ({ onSuccess, message, mode }) => {
  return (
    <div className="auth-content">
      {message && <p className="auth-message">{message}</p>}
      <AuthTabs onSuccess={onSuccess} mode={mode} />
    </div>
  );
};

export default AuthContent;
