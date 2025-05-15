import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Border } from '@/components/ui'; // Por los momentos solo importo el Border
import { Aquarium, Library, Culture, Forum, ArticleDetail, PostDetail } from '@/pages'; // Importamos PostDetail
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import '/src/css/App.css';
import { Aqua } from './Aqua';
import { Map } from './Map';
import { River } from './River';

const homeVariants = {
    initial: {
        opacity: 0,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        scale: 1.05,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

// Texto que aparecerá caracter por caracter
const KUAIMARE_TEXT = "Kuai-Mare está aquí para guiarte en tu viaje por este océano de información. Con su sabiduría infinita y su comprensión profunda, te ayudará a navegar en las aguas turbulentas de la búsqueda del conocimiento, brindándote claridad y apoyo en cada paso del camino.";

function Home() {
  const navigate = useNavigate();

  // Estado para la posición relativa del mouse respecto al centro de la pantalla
  const [kuaiPos, setKuaiPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado para el texto tipo máquina de escribir
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Coordenadas del mouse relativas al centro del contenedor
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;
      // Limitar el movimiento máximo (en px)
      const maxMove = 40;
      // Normalizar y limitar
      const limitedX = Math.max(-maxMove, Math.min(maxMove, offsetX / 10));
      const limitedY = Math.max(-maxMove, Math.min(maxMove, offsetY / 10));
      setKuaiPos({ x: limitedX, y: limitedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Efecto para mostrar el texto caracter por caracter
  useEffect(() => {
    if (textIndex < KUAIMARE_TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + KUAIMARE_TEXT[textIndex]);
        setTextIndex((prev) => prev + 1);
      }, 22); // velocidad tipo N64, puedes ajustar el delay
      return () => clearTimeout(timeout);
    }
  }, [textIndex]);

  // Permitir que al hacer click se muestre todo el texto de una vez
  const handleTextClick = () => {
    if (displayedText.length < KUAIMARE_TEXT.length) {
      setDisplayedText(KUAIMARE_TEXT);
      setTextIndex(KUAIMARE_TEXT.length);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden"
        style={{
          backgroundImage: "url('/src/assets/background/background-desktop.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          userSelect: 'none',
        }}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={homeVariants}
      >
        {/* Logo en la parte superior */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20">
            <img
                src="/src/assets/logo/logo.svg"
                alt="Logo"
                className="w-80 h-auto"
                style={{ userSelect: 'none' }}
            />
        </div>

        {/* Contenido centrado */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <motion.img
                src="/src/assets/chatbot/kuai-mare.svg"
                alt="Kuai Mare"
                className="w-125 h-auto mb-8"
                style={{ userSelect: 'none' }}
                animate={{
                  x: kuaiPos.x,
                  y: kuaiPos.y,
                }}
                transition={{
                  type: "spring",
                  stiffness: 40,
                  damping: 15,
                  mass: 0.8,
                }}
            />
            <div
                className="w-[1030px] h-60 text-center justify-start text-white text-3xl font-normal pointer-events-auto cursor-pointer relative z-20"
                onClick={handleTextClick}
            >
                <p>
                  {displayedText}
                  <span className="animate-pulse">{displayedText.length < KUAIMARE_TEXT.length ? '▋' : ''}</span>
                </p>
            </div>
        </div>

        {/* Imágenes debajo de las esquinas */}
        <div className="absolute top-0 left-0 z-0">
          <img
            src="/src/assets/background/sun.svg"
            alt="Top Left Image"
            className="w-250 h-250"
          />
        </div>
        <div className="absolute top-0 right-0 z-0">
          <img
            src="/src/assets/background/leaf.svg"
            alt="Top Right Image"
            className="w-100 h-100"
          />
        </div>
        <div className="absolute top-0 right-0 z-0 mix-blend-saturation">
          <img
            src="/src/assets/background/leaf-background.svg"
            alt="Top Right Background Image"
            className="w-150 h-150"
          />
        </div>
        <div className="absolute bottom-0 left-0 z-0">
          <img
            src="/src/assets/background/fire.svg"
            alt="Top Right Background Image"
            className="w-300 h-300"
          />
        </div>
        <div className="absolute bottom-0 right-0 z-0">
          <img
            src="/src/assets/background/water.svg"
            alt="Top Right Background Image"
            className="w-225 h-125"
          />
        </div>

        {/* Esquinas decorativas con navegación */}
        <div className="absolute top-0 left-0 z-30" onClick={() => navigate('/forum')}>
          <Border src="/src/assets/icons/border_top_left.svg" alt="Top Left Border" />
        </div>
        <div className="absolute top-0 right-0 z-30" onClick={() => navigate('/culture')}>
          <Border src="/src/assets/icons/border_top_right.svg" alt="Top Right Border" />
        </div>
        <div className="absolute bottom-0 left-0 z-30" onClick={() => navigate('/library')}>
          <Border src="/src/assets/icons/border_bottom_left.svg" alt="Bottom Left Border" />
        </div>
        <div className="absolute bottom-0 right-0 z-30" onClick={() => navigate('/aqua')}>
          <Border src="/src/assets/icons/border_bottom_right.svg" alt="Bottom Right Border" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aqua" element={<Aqua />} />
          <Route path="/aquarium" element={<Aquarium />} />
          <Route path="/map" element={<Map />} />
          <Route path="/library" element={<Library />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/river" element={<River />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}