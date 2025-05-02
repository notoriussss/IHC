import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Border } from '@/components/ui/Border';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: '-100vw' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '100vw' },
};

function Home() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative w-full h-screen bg-[#2d2d2d] overflow-hidden"
      style={{
        backgroundImage: "url('/src/assets/background/background-desktop.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        userSelect: 'none',
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      {/* Logo centrado horizontalmente */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
        <img
          src="/src/assets/logo/logo.svg"
          alt="Logo"
          className="w-80 h-auto"
          style={{ userSelect: 'none' }}
        />
        <img
          src="/src/assets/chatbot/kuai-mare.svg"
          alt="Kuai Mare"
          className="w-125 h-auto mt-18"
          style={{ userSelect: 'none' }}
        />
        <div
          className="w-[900px] h-[250px] text-white p-5 flex items-center justify-center text-center font-mono text-[35px]"
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
      <div className="absolute top-0 left-0 z-10" onClick={() => navigate('/page1')}>
        <Border src="/src/assets/icons/border_top_left.svg" alt="Top Left Border" />
      </div>
      <div className="absolute top-0 right-0 z-10" onClick={() => navigate('/page2')}>
        <Border src="/src/assets/icons/border_top_right.svg" alt="Top Right Border" />
      </div>
      <div className="absolute bottom-0 left-0 z-10" onClick={() => navigate('/page3')}>
        <Border src="/src/assets/icons/border_bottom_left.svg" alt="Bottom Left Border" />
      </div>
      <div className="absolute bottom-0 right-0 z-10" onClick={() => navigate('/page4')}>
        <Border src="/src/assets/icons/border_bottom_right.svg" alt="Bottom Right Border" />
      </div>
    </motion.div>
  );
}

function Page1() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative w-full h-screen bg-[#FFB700] flex items-center justify-center text-white"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      {/* Logo para volver a la página inicial */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
        <img
          src="/src/assets/logo/logo.svg"
          alt="Logo"
          className="w-80 h-auto"
          style={{ userSelect: 'none' }}
        />
      </div>
      <h1 className="text-4xl">¡Bienvenido a la Página 1!</h1>
    </motion.div>
  );
}

function Page2() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative w-full h-screen bg-[#3BA100] flex items-center justify-center text-white"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      {/* Logo para volver a la página inicial */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
        <img
          src="/src/assets/logo/logo.svg"
          alt="Logo"
          className="w-80 h-auto"
          style={{ userSelect: 'none' }}
        />
      </div>
      <h1 className="text-4xl">¡Bienvenido a la Página 2!</h1>
    </motion.div>
  );
}

function Page3() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative w-full h-screen bg-[#4D2308] flex items-center justify-center text-white"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      {/* Logo para volver a la página inicial */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
        <img
          src="/src/assets/logo/logo.svg"
          alt="Logo"
          className="w-80 h-auto"
          style={{ userSelect: 'none' }}
        />
      </div>
      <h1 className="text-4xl">¡Bienvenido a la Página 3!</h1>
    </motion.div>
  );
}

function Page4() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative w-full h-screen bg-[#00A89A] flex items-center justify-center text-white"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      {/* Logo para volver a la página inicial */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
        <img
          src="/src/assets/logo/logo.svg"
          alt="Logo"
          className="w-80 h-auto"
          style={{ userSelect: 'none' }}
        />
      </div>
      <h1 className="text-4xl">¡Bienvenido a la Página 4!</h1>
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="/page4" element={<Page4 />} />
      </Routes>
    </Router>
  );
}