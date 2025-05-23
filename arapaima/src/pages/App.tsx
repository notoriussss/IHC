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
  const [rotation, setRotation] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [previousHoveredItem, setPreviousHoveredItem] = useState<number | null>(null);
  const [shouldTransition, setShouldTransition] = useState(false);

  const menuItems = [
    { 
      path: '/forum', 
      icon: '/src/assets/icons/forum-icon.png', 
      label: 'FORO', 
      angle: 45,
      bgColor: 'rgba(0, 0, 0, 0.3)',  // Transparente oscuro por defecto
      hoverBgColor: 'rgba(255, 183, 0, 0.75)',  // #FFB700
      borderColor: 'rgba(255, 183, 0, 0.3)'
    },
    { 
      path: '/culture', 
      icon: '/src/assets/icons/culture-icon.png', 
      label: 'CULTURA', 
      angle: 135,
      bgColor: 'rgba(0, 0, 0, 0.3)',
      hoverBgColor: 'rgba(59, 161, 0, 0.75)',  // #3BA100
      borderColor: 'rgba(59, 161, 0, 0.3)'
    },
    { 
      path: '/library', 
      icon: '/src/assets/icons/library-icon.png', 
      label: 'BIBLIOTECA', 
      angle: 225,
      bgColor: 'rgba(0, 0, 0, 0.3)',
      hoverBgColor: 'rgba(77, 35, 8, 0.75)',  // #4D2308
      borderColor: 'rgba(77, 35, 8, 0.3)'
    },
    { 
      path: '/aqua', 
      icon: '/src/assets/icons/fish-icon.png', 
      label: 'ACUARIO', 
      angle: 315,
      bgColor: 'rgba(0, 0, 0, 0.3)',
      hoverBgColor: 'rgba(0, 168, 154, 0.75)',  // #00A89A
      borderColor: 'rgba(0, 168, 154, 0.3)'
    }
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
    }
  };

  // Efecto para mostrar el texto caracter por caracter
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (textIndex < currentText.length) {
      timeoutId = setTimeout(() => {
        setDisplayedText(currentText.substring(0, textIndex + 1));
        setTextIndex((prev) => prev + 1);
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
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center"
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
        {/* Logo - solo visible en desktop */}
        <div className="absolute top-5 left-5 z-20 hidden md:block">
          <img
            src="/src/assets/logo/logo.svg"
            alt="Logo"
            className="w-60 h-auto"
            style={{ userSelect: 'none' }}
          />
        </div>

        {/* Logo centrado para móviles */}
        <div className="md:hidden flex justify-center items-center mb-4 mt-6">
          <img
            src="/src/assets/logo/logo.svg"
            alt="Logo"
            className="w-64 h-auto"
            style={{ userSelect: 'none' }}
          />
        </div>

        {/* Contenedor principal del medallón */}
        <div className="relative md:w-[900px] md:h-[900px] w-[400px] h-[400px] flex items-center justify-center md:mt-0 -mt-10">
          {/* Kuai Mare decorativo de fondo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/src/assets/chatbot/kuai-mare-1.svg"
              alt="Kuai Mare Background"
              className="md:w-[1200px] md:h-[1200px] w-[500px] h-[500px] absolute"
              style={{ 
                opacity: 0.15,
                filter: 'brightness(0.8) sepia(0.5) hue-rotate(70deg) saturate(120%)',
                transform: 'scale(1.2)',
                userSelect: 'none'
              }}
            />
          </div>

          {/* Círculo Warao decorativo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src="/src/assets/icons/circle-warao.png"
              alt="Círculo Warao"
              className="md:w-[800px] md:h-[800px] w-[350px] h-[350px] absolute"
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
            className="absolute md:w-[800px] md:h-[800px] w-[350px] h-[350px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,20,0,0.9) 0%, rgba(0,10,0,0.7) 100%)',
              border: '3px solid rgba(0,255,100,0.15)',
              boxShadow: 'inset 0 0 50px rgba(0,50,0,0.5), 0 0 30px rgba(0,50,0,0.5)'
            }}
          />

          {/* Texto descriptivo */}
          <div 
            className="absolute md:w-[450px] w-[200px] text-center text-white md:text-xl text-xs font-normal z-30 transition-all duration-300 cursor-pointer"
            style={{
              opacity: shouldTransition ? (isTextVisible ? 1 : 0) : 1,
              filter: shouldTransition ? (isTextVisible ? 'blur(0px)' : 'blur(4px)') : 'blur(0px)',
              textShadow: '0 0 10px rgba(0,255,100,0.3)'
            }}
            onClick={handleTextClick}
          >
            <p className="md:text-lg text-[11px] leading-tight md:leading-relaxed mx-auto">
              {displayedText}
              <span className="animate-pulse">
                {displayedText.length < currentText.length ? '▋' : ''}
              </span>
            </p>
          </div>

          {/* Menú circular */}
          <div className="absolute w-full h-full">
            {menuItems.map((item, index) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = window.innerWidth > 768 ? 350 : 170;
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
                    className="md:w-32 md:h-32 w-20 h-20 rounded-full flex flex-col items-center justify-center md:gap-3 gap-2 cursor-pointer transition-all duration-300"
                    style={{
                      background: hoveredItem === index 
                        ? item.hoverBgColor
                        : item.bgColor,
                      border: hoveredItem === index 
                        ? `2px solid ${item.borderColor}`
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      transform: hoveredItem === index ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: hoveredItem === index
                        ? `0 0 20px ${item.borderColor}`
                        : '0 0 10px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={() => handleItemHover(index)}
                    onMouseLeave={() => handleItemHover(null)}
                    onClick={() => navigate(item.path)}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="md:w-14 md:h-14 w-8 h-8 transition-all duration-200"
                      style={{
                        filter: 'brightness(0) invert(1)'
                      }}
                    />
                    <span 
                      className="md:text-sm text-[10px] font-bold transition-all duration-200"
                      style={{
                        color: '#ffffff',
                        textShadow: hoveredItem === index 
                          ? '0 0 10px rgba(0,0,0,0.3)'
                          : '0 0 10px rgba(0,0,0,0.5)'
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