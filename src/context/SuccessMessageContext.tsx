import React, { createContext, useContext, useState } from 'react';

interface SuccessMessageContextType {
  showSuccessMessage: (message: string) => void;
  showSuccess: (message: string) => void;
  message: string | null;
  clearMessage: () => void;
}

const SuccessMessageContext = createContext<SuccessMessageContextType | undefined>(undefined);

export const SuccessMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);

  const showSuccessMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const showSuccess = showSuccessMessage;

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <SuccessMessageContext.Provider value={{ showSuccessMessage, showSuccess, message, clearMessage }}>
      {children}
      {message && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {message}
        </div>
      )}
    </SuccessMessageContext.Provider>
  );
};

export const useSuccessMessage = () => {
  const context = useContext(SuccessMessageContext);
  if (context === undefined) {
    throw new Error('useSuccessMessage must be used within a SuccessMessageProvider');
  }
  return context;
}; 