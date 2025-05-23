import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
const KUAIMARE_TEXT =
    "Kuai-Mare está aquí para guiarte en tu viaje por este océano de información. Con su sabiduría infinita y su comprensión profunda, te ayudará a navegar en las aguas turbulentas de la búsqueda del conocimiento, brindándote claridad y apoyo en cada paso del camino.";

// Variaciones
const KUAIMARE_TEXT_VARIATIONS = [
    "Kuai-Mare escucha las voces que surgen del río del diálogo. En este espacio de encuentro, él te invita a compartir tus pensamientos, aprender de otros viajeros y construir juntos un cauce de sabiduría colectiva.",
    "En los reflejos del agua, Kuai-Mare guarda los relatos antiguos y las costumbres vivas. Aquí te guía a través de los mitos, los cantos, y los saberes que dan alma a la región Guayana, despertando en ti la memoria del espíritu warao.",
    "Como guardián del conocimiento ancestral, Kuai-Mare te abre las puertas de esta vasta corriente de libros, textos y saberes. Sumérgete con él en la profundidad del conocimiento, donde cada página es una gota del río eterno del aprendizaje.",
    "Kuai-Mare fluye donde el agua canta. Conoce los secretos de los ríos, las lagunas y los caños que dan vida a la Guayana. A través de su mirada ancestral, entenderás la conexión sagrada entre el mundo líquido y los seres que lo habitan.",
];

function Home() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState(KUAIMARE_TEXT);
  const [currentImage, setCurrentImage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [previousHoveredItem, setPreviousHoveredItem] = useState<number | null>(null);
  const [shouldTransition, setShouldTransition] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const menuItems = [
    { path: '/forum', icon: '/src/assets/icons/forum-icon.png', label: 'FORO', angle: 45 },
    { path: '/culture', icon: '/src/assets/icons/culture-icon.png', label: 'CULTURA', angle: 135 },
    { path: '/library', icon: '/src/assets/icons/library-icon.png', label: 'BIBLIOTECA', angle: 225 },
    { path: '/aqua', icon: '/src/assets/icons/fish-icon.png', label: 'ACUARIO', angle: 315 }
  ];

  const handleItemHover = (index: number | null) => {
    if (index !== previousHoveredItem && index !== null) {
      setShouldTransition(true);
      setIsTextVisible(false);
      setTimeout(() => {
        setHoveredItem(index);
        const targetAngle = menuItems[index].angle;
        let newRotation = targetAngle;
        const currentRotation = rotation % 360;
        const diff = ((targetAngle - currentRotation + 540) % 360) - 180;
        newRotation = currentRotation + diff;
        setRotation(newRotation);
        handleCornerHover(index);
        setIsTextVisible(true);
        setShouldTransition(false);
      }, 300);
    } else {
      setHoveredItem(index);
      if (index !== null) {
        handleCornerHover(index);
      }
    }
    setPreviousHoveredItem(index);
  };

  // Función para manejar el hover en las esquinas
  const handleCornerHover = (index: number) => {
    const newText = KUAIMARE_TEXT_VARIATIONS[index];
    if (newText !== currentText) {
      setCurrentText(newText);
      setDisplayedText('');
      setTextIndex(0);
      setCurrentImage(1);
    }
  };

  // Efecto para mostrar el texto caracter por caracter y alternar la imagen
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (textIndex < currentText.length) {
      timeoutId = setTimeout(() => {
        setDisplayedText(currentText.substring(0, textIndex + 1));
        setTextIndex((prev) => prev + 1);
        // Cambia la imagen cada 5 caracteres, pero asegura que termine en 1
        if (textIndex % 4 === 0) {
          if (textIndex < currentText.length - 4) {
            setCurrentImage((prev) => prev === 1 ? 2 : 1);
          } else {
            setCurrentImage(1);
          }
        }
      }, 22);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [textIndex, currentText]);

  // Efecto para establecer el texto inicial
  useEffect(() => {
    setCurrentText(KUAIMARE_TEXT);
  }, []);

  // Permitir que al hacer click se muestre todo el texto de una vez
  const handleTextClick = () => {
    if (textIndex < currentText.length) {
      setDisplayedText(currentText);
      setTextIndex(currentText.length);
      setCurrentImage(1);
    }
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (event.clientX - centerX) / 50;
      const moveY = (event.clientY - centerY) / 50;
      setMousePosition({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center"
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

        {/* Contenedor principal del medallón */}
        <div className="relative w-[700px] h-[700px] flex items-center justify-center">
          {/* Círculo Warao decorativo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src="/src/assets/icons/circle-warao.png"
              alt="Círculo Warao"
              className="w-[600px] h-[600px] absolute"
              style={{
                filter: 'brightness(2) contrast(1.2) sepia(0.5) saturate(120%) hue-rotate(70deg)',
                opacity: 0.8,
                mixBlendMode: 'screen'
              }}
              animate={{
                rotate: rotation
              }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 15
              }}
            />
          </div>

          {/* Medallón base */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,20,0,0.9) 0%, rgba(0,10,0,0.7) 100%)',
              border: '3px solid rgba(0,255,100,0.15)',
              boxShadow: 'inset 0 0 50px rgba(0,50,0,0.5), 0 0 30px rgba(0,50,0,0.5)'
            }}
          />

          {/* Texto descriptivo */}
          <div 
            className="absolute w-[400px] text-center text-white text-lg font-normal z-30 transition-all duration-300 cursor-pointer"
            style={{
              opacity: shouldTransition ? (isTextVisible ? 1 : 0) : 1,
              filter: shouldTransition ? (isTextVisible ? 'blur(0px)' : 'blur(4px)') : 'blur(0px)',
              textShadow: '0 0 10px rgba(0,255,100,0.3)',
              transform: 'translateY(40px)'
            }}
            onClick={handleTextClick}
          >
            <p className="text-sm leading-tight">
              {displayedText}
              <span className="animate-pulse">
                {displayedText.length < currentText.length ? '▋' : ''}
              </span>
            </p>
          </div>

          {/* Kuai Mare en el centro */}
          <motion.div 
            className="absolute w-70 h-70 z-25"
            style={{
              bottom: '40%',
              transform: 'translate(-50%, -50%) translateY(-120px)'
            }}
            animate={{
              x: mousePosition.x,
              y: mousePosition.y
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
              mass: 1
            }}
          >
            <img
              src={`/src/assets/chatbot/kuai-mare-${currentImage}.svg`}
              alt="Kuai Mare"
              className="w-full h-full"
              style={{ 
                userSelect: 'none',
                filter: 'drop-shadow(0 0 10px rgba(0,255,100,0.3))'
              }}
            />
          </motion.div>

          {/* Menú circular */}
          <div className="absolute w-full h-full">
            {menuItems.map((item, index) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = 250;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              return (
                <motion.div
                  key={item.path}
                  className="absolute z-30"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                    style={{
                      background: hoveredItem === index 
                        ? 'radial-gradient(circle, rgba(200,255,220,0.95) 0%, rgba(150,255,180,0.85) 100%)'
                        : 'radial-gradient(circle, rgba(0,40,0,0.8) 0%, rgba(0,20,0,0.6) 100%)',
                      border: hoveredItem === index 
                        ? '2px solid rgba(100,255,150,1)' 
                        : '2px solid rgba(0,255,100,0.2)',
                      transform: hoveredItem === index ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: hoveredItem === index
                        ? '0 0 20px rgba(0,255,100,0.3)'
                        : '0 0 10px rgba(0,50,0,0.5)'
                    }}
                    onMouseEnter={() => handleItemHover(index)}
                    onMouseLeave={() => handleItemHover(null)}
                    onClick={() => navigate(item.path)}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-10 h-10 transition-all duration-200"
                      style={{
                        filter: hoveredItem === index 
                          ? 'brightness(0) saturate(100%)'
                          : 'brightness(0) invert(1) sepia(0.5) saturate(200%) hue-rotate(70deg)'
                      }}
                    />
                    <span 
                      className="text-xs font-bold transition-all duration-200"
                      style={{
                        color: hoveredItem === index ? '#003810' : '#00ff80',
                        textShadow: hoveredItem === index 
                          ? 'none'
                          : '0 0 10px rgba(0,255,100,0.5)'
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Background images */}
        <div className="absolute top-0 left-0 z-0">
          <img src="/src/assets/background/sun.svg" alt="Top Left Image" className="w-200 h-200" />
        </div>
        <div className="absolute top-0 right-0 z-0">
          <img src="/src/assets/background/leaf.svg" alt="Top Right Image" className="w-110 h-110" />
        </div>
        <div className="absolute top-0 right-0 z-0 mix-blend-saturation">
          <img src="/src/assets/background/leaf-background.svg" alt="Top Right Background Image" className="w-150 h-150" />
        </div>
        <div className="absolute bottom-0 left-0 z-0">
          <img src="/src/assets/background/fire.svg" alt="Bottom Left Image" className="w-300 h-300" />
        </div>
        <div className="absolute bottom-0 right-0 z-0">
          <img src="/src/assets/background/water.svg" alt="Bottom Right Image" className="w-225 h-125" />
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