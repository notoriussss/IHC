import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const pageTransition = {
    initial: {
        opacity: 0,
        scale: 0.8,
        x: '100%',
        y: '100%'
    },
    animate: {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export function Aqua() {
    const navigate = useNavigate();
    const [hoverStates, setHoverStates] = useState({
        acuario: false,
        rios: false,
        mapa: false,
        logo: false
    });

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                className="fixed inset-0 bg-black"
                initial="initial"
                animate="animate"
                variants={pageTransition}
            >
                <div className="w-full h-full relative">
                    {/* Logo central */}
                    <motion.div
                        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 cursor-pointer transition-transform duration-300"
                        onClick={() => navigate('/')}
                        onHoverStart={() => setHoverStates(prev => ({ ...prev, logo: true }))}
                        onHoverEnd={() => setHoverStates(prev => ({ ...prev, logo: false }))}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="relative w-48 h-48 bg-black bg-opacity-80 rounded-full flex items-center justify-center shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-transparent rounded-full opacity-50" />
                            <img
                                src="/src/assets/logo/logo.svg"
                                alt="Logo Arapaima"
                                className="w-40 h-40"
                                style={{ filter: 'brightness(1)', transition: 'filter 0.3s ease' }}
                            />
                        </div>
                    </motion.div>

                    {/* Sección izquierda - Acuario */}
                    <motion.div 
                        className="absolute top-0 left-0 w-1/2 h-full group cursor-pointer"
                        onHoverStart={() => setHoverStates(prev => ({ ...prev, acuario: true }))}
                        onHoverEnd={() => setHoverStates(prev => ({ ...prev, acuario: false }))}
                        onClick={() => navigate('/aquarium')}
                        style={{
                            backgroundImage: 'url("/src/assets/background/background-aquarium.png")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)",
                            filter: `brightness(${hoverStates.acuario ? '100%' : hoverStates.rios || hoverStates.mapa || hoverStates.logo ? '40%' : '100%'})`,
                            transition: 'filter 0.5s ease'
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center gap-8">
                            <motion.img
                                src={hoverStates.acuario ? "/src/assets/icons/fish_black.png" : "/src/assets/icons/fish.png"}
                                alt="Icono Acuario"
                                className={`w-24 h-24 transition-all duration-500 ${hoverStates.acuario ? 'filter-none scale-110' : 'brightness-0 invert'}`}
                                style={{ transformOrigin: 'center' }}
                            />
                            <motion.span 
                                className={`text-6xl font-bold transition-all duration-500 ${hoverStates.acuario ? 'text-black scale-110' : 'text-white'}`}
                                style={{ transformOrigin: 'center' }}
                            >
                                ACUARIO
                            </motion.span>
                        </div>
                    </motion.div>
                    
                    {/* Sección derecha - Rios */}
                    <motion.div 
                        className="absolute top-0 right-0 w-1/2 h-full group cursor-pointer"
                        onHoverStart={() => setHoverStates(prev => ({ ...prev, rios: true }))}
                        onHoverEnd={() => setHoverStates(prev => ({ ...prev, rios: false }))}
                        onClick={() => navigate('/river')}
                        style={{
                            backgroundImage: 'url("/src/assets/background/background_river.svg")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 50%)",
                            filter: `brightness(${hoverStates.rios ? '100%' : hoverStates.acuario || hoverStates.mapa || hoverStates.logo ? '40%' : '100%'})`,
                            transition: 'filter 0.5s ease'
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center gap-8">
                            <motion.img
                                src={hoverStates.rios ? "/src/assets/icons/river_black.png" : "/src/assets/icons/river.png"}
                                alt="Icono Rios"
                                className={`w-24 h-24 transition-all duration-500 ${hoverStates.rios ? 'filter-none scale-110' : 'brightness-0 invert'}`}
                                style={{ transformOrigin: 'center' }}
                            />
                            <motion.span 
                                className={`text-6xl font-bold transition-all duration-500 ${hoverStates.rios ? 'text-black scale-110' : 'text-white'}`}
                                style={{ transformOrigin: 'center' }}
                            >
                                RIOS
                            </motion.span>
                        </div>
                    </motion.div>

                    {/* Sección central (abajo) - Mapa */}
                    <motion.div 
                        className="absolute bottom-0 left-0 w-full h-1/2 group cursor-pointer"
                        onHoverStart={() => setHoverStates(prev => ({ ...prev, mapa: true }))}
                        onHoverEnd={() => setHoverStates(prev => ({ ...prev, mapa: false }))}
                        onClick={() => navigate('/map')}
                        style={{
                            backgroundImage: 'url("/src/assets/background/background-map.svg")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            clipPath: "polygon(50% 0%, 0 100%, 100% 100%)",
                            filter: `brightness(${hoverStates.mapa ? '100%' : hoverStates.acuario || hoverStates.rios || hoverStates.logo ? '40%' : '100%'})`,
                            transition: 'filter 0.5s ease'
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center gap-8">
                            <motion.img
                                src={hoverStates.mapa ? "/src/assets/icons/map_black.png" : "/src/assets/icons/map.png"}
                                alt="Icono Mapa"
                                className={`w-24 h-24 transition-all duration-500 ${hoverStates.mapa ? 'filter-none scale-110' : 'brightness-0 invert'}`}
                                style={{ transformOrigin: 'center' }}
                            />
                            <motion.span 
                                className={`text-6xl font-bold transition-all duration-500 ${hoverStates.mapa ? 'text-black scale-110' : 'text-white'}`}
                                style={{ transformOrigin: 'center' }}
                            >
                                MAPA
                            </motion.span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}