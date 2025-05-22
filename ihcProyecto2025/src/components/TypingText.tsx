import React, { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
}

export const TypingText: React.FC<TypingTextProps> = ({ text, speed = 50 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayText}</span>;
}; 