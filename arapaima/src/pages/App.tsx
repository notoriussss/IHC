import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Border } from '@/components/ui'; // Por los momentos solo importo el Border
import { Aquarium, Library, Culture, Forum, ArticleDetail, PostDetail } from '@/pages'; // Importamos PostDetail
import { motion, AnimatePresence } from 'framer-motion';

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

function Home() {
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      <motion.div
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <img
                src="/src/assets/chatbot/kuai-mare.svg"
                alt="Kuai Mare"
                className="w-125 h-auto mb-8"
                style={{ userSelect: 'none' }}
            />
            <div
                className="w-[900px] text-white p-5 flex items-center justify-center text-center font-mono text-[35px]"
                style={{ userSelect: 'none' }}
            >
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
        <div className="absolute top-0 left-0 z-10" onClick={() => navigate('/forum')}>
          <Border src="/src/assets/icons/border_top_left.svg" alt="Top Left Border" />
        </div>
        <div className="absolute top-0 right-0 z-10" onClick={() => navigate('/culture')}>
          <Border src="/src/assets/icons/border_top_right.svg" alt="Top Right Border" />
        </div>
        <div className="absolute bottom-0 left-0 z-10" onClick={() => navigate('/library')}>
          <Border src="/src/assets/icons/border_bottom_left.svg" alt="Bottom Left Border" />
        </div>
        <div className="absolute bottom-0 right-0 z-10" onClick={() => navigate('/aquarium')}>
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
          <Route path="/aquarium" element={<Aquarium />} />
          <Route path="/library" element={<Library />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}