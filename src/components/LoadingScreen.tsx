import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
  modelName: string;
  isDownloading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, modelName, isDownloading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <motion.h2
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        style={{ marginBottom: '20px' }}
      >
        {isDownloading ? 'Descargando modelo...' : 'Cargando modelo...'}
      </motion.h2>
      
      <motion.p
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        style={{ marginBottom: '30px' }}
      >
        {modelName}
      </motion.p>

      <div
        style={{
          width: '300px',
          height: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
            borderRadius: '10px'
          }}
        />
      </div>

      <motion.p
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        style={{ marginTop: '10px' }}
      >
        {progress.toFixed(1)}%
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen; 