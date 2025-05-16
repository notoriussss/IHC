import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import fishes from '@/data/fishes.json';

const pageTransition = {
    initial: {
        opacity: 0,
        scale: 0.8,
        x: '-100%'
    },
    animate: {
        opacity: 1,
        scale: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        x: '-100%',
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const overlayTransition = {
    initial: {
        background: 'radial-gradient(circle at bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        opacity: 0
    },
    animate: {
        background: 'radial-gradient(circle at bottom right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)',
        opacity: 1,
        transition: {
            duration: 0.8,
            background: {
                delay: 0.2,
                duration: 0.6
            }
        }
    }
};

const contentAnimation = {
    initial: { opacity: 0 },
    animate: { 
        opacity: 1,
        transition: {
            duration: 0.3,
            delay: 0.3
        }
    }
};

const fishVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
};

const pageIndicatorAnimation = {
    initial: {
        x: 100,
        opacity: 0
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const iconAnimation = {
    initial: {
        scale: 0,
        opacity: 0,
        rotate: -180
    },
    animate: {
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: {
            duration: 0.5,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export function Aquarium() {
    const navigate = useNavigate();
    const [currentFishIndex, setCurrentFishIndex] = useState(0);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const currentFish = fishes[currentFishIndex];

    useEffect(() => {
        setIsFirstRender(false);
    }, []);

    const handlePreviousFish = () => {
        setCurrentFishIndex((prevIndex) =>
            prevIndex === 0 ? fishes.length - 1 : prevIndex - 1
        );
    };

    const handleNextFish = () => {
        setCurrentFishIndex((prevIndex) =>
            prevIndex === fishes.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleNavigateBack = () => {
        navigate('/aqua', { state: { from: 'aquarium' } });
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                handlePreviousFish();
            } else if (event.key === 'ArrowRight') {
                handleNextFish();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="flex flex-col inset-0"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageTransition}
                style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                }}
            >
                <motion.div
                    className="absolute inset-0"
                    variants={overlayTransition}
                />
                
                <motion.div
                    className="relative w-full h-full flex flex-col text-white"
                    variants={contentAnimation}
                    style={{
                        backgroundImage: "url('/src/assets/background/background-aquarium.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Barra superior con ícono, título y logo */}
                    <div className="stiky top-0 left-0 right-0 bg-black/20 backdrop-blur-sm z-50 py-5">
                        <div className="flex items-center px-8">
                            <div className="flex items-center gap-3 flex-1">
                                <motion.div 
                                    className="w-20 h-20 flex items-center justify-center"
                                    variants={iconAnimation}
                                >
                                    <img 
                                        src="/src/assets/icons/fish.png"
                                        alt="Fish Icon"
                                        className="w-full h-full object-contain"
                                    />
                                </motion.div>
                                <motion.h2 
                                    className="text-3xl font-bold text-white"
                                    variants={pageIndicatorAnimation}
                                >
                                    Acuario
                                </motion.h2>
                            </div>

                            <motion.div
                                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                                onClick={() => navigate('/')}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                                <img
                                    src="/src/assets/logo/logo.svg"
                                    alt="Logo"
                                    className="w-60 h-auto"
                                />
                            </motion.div>

                            {/* Botón de volver */}
                            <div className="flex-1 flex justify-end">
                                <motion.div
                                    className="flex items-center gap-6 cursor-pointer"
                                    onClick={handleNavigateBack}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                >
                                    <img
                                        src="/src/assets/icons/back.png"
                                        alt="Volver"
                                        className="w-12 h-12"
                                    />
                                    <span className="text-white text-xl">Volver</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Contenedor centralizado */}
                    <div className="flex flex-1 items-center justify-center px-8 py-6 mt-5 mb-12  custom-scrollbar-blue">
                        <div className="w-[60%] mx-auto flex flex-col items-center justify-center text-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentFishIndex}
                                    variants={fishVariants}
                                    initial={isFirstRender ? false : "initial"}
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col p-20 items-center bg-black/20 backdrop-blur-sm rounded-xl"
                                >
                                    <h1 className="text-4xl font-bold mb-8">{currentFish.name}</h1>
                                    <p className="text-lg mb-8">{currentFish.data}</p>
                                    
                                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                                        {Object.entries(currentFish.characteristics).map(([key, value]) => (
                                            <motion.div
                                                key={key}
                                                className="bg-gray-800/60 p-2 rounded-md shadow-md text-sm"
                                                whileHover={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    scale: 1.05
                                                }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <strong>{key}:</strong> {value}
                                            </motion.div>
                                        ))}
                                    </div>

                                    <img
                                        src={currentFish.image}
                                        alt={currentFish.name}
                                        className="w-125 h-80 object-cover rounded-lg mt-8"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Flechas de navegación mejoradas */}
                    <motion.div
                        className="absolute left-32 top-1/2 transform -translate-y-1/2 cursor-pointer z-20 bg-black/30 p-4 rounded-full backdrop-blur-sm hover:bg-black/50 transition-all"
                        onClick={handlePreviousFish}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <motion.img
                            src="/src/assets/icons/arrow-left.svg"
                            alt="Flecha izquierda"
                            className="w-12 h-12"
                            whileHover={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                        <motion.img
                            src="/src/assets/icons/arrow-left-hover.svg"
                            alt="Flecha izquierda hover"
                            className="w-12 h-12 absolute top-4 left-4"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        />
                    </motion.div>

                    <motion.div
                        className="absolute right-32 top-1/2 transform -translate-y-1/2 cursor-pointer z-20 bg-black/30 p-4 rounded-full backdrop-blur-sm hover:bg-black/50 transition-all"
                        onClick={handleNextFish}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <motion.img
                            src="/src/assets/icons/arrow-right.svg"
                            alt="Flecha derecha"
                            className="w-12 h-12"
                            whileHover={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                        <motion.img
                            src="/src/assets/icons/arrow-right-hover.svg"
                            alt="Flecha derecha hover"
                            className="w-12 h-12 absolute top-4 left-4"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}