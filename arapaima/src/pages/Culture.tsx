import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import articles from '@/data/data.json'; // Importamos el JSON con los datos

const overlayTransition = {
    initial: {
        background: 'radial-gradient(circle at top right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        opacity: 0
    },
    animate: {
        background: 'radial-gradient(circle at top right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)',
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

const pageIndicatorAnimation = {
    initial: {
        x: -100,
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
        rotate: 180
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

const pageTransitionFromArticle = {
    initial: {
        opacity: 0,
        x: '-100%'
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const pageTransitionDefault = {
    initial: {
        opacity: 0,
        scale: 0.8,
        x: '100%',
        y: '-100%'
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

export function Culture() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const currentArticle = articles[currentArticleIndex];

    const isFromArticle = location.state?.from === 'article-detail';
    const pageTransition = isFromArticle ? pageTransitionFromArticle : pageTransitionDefault;

    const handlePreviousArticle = () => {
        setDirection(-1);
        setCurrentArticleIndex((prevIndex) =>
            prevIndex === 0 ? articles.length - 1 : prevIndex - 1
        );
    };

    const handleNextArticle = () => {
        setDirection(1);
        setCurrentArticleIndex((prevIndex) =>
            prevIndex === articles.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleDotClick = (index: number) => {
        setDirection(index > currentArticleIndex ? 1 : -1);
        setCurrentArticleIndex(index);
    };

    const slideVariants = {
        initial: (direction: number) => ({
            x: direction * 500,
            opacity: 0
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        },
        exit: (direction: number) => ({
            x: direction * -500,
            opacity: 0,
            transition: {
                duration: 0.5
            }
        })
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="fixed inset-0"
                initial="initial"
                animate="animate"
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
                    className="relative w-full h-full flex flex-col items-center justify-start text-white"
                    variants={contentAnimation}
                    style={{
                        backgroundImage: "url('/src/assets/background/background-culture.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        overflow: 'hidden'
                    }}
                >
                    {/* Barra superior con ícono y título */}
                    <div className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-sm z-50 py-5">
                        <div className="flex items-center px-8">
                            <div className="flex items-center gap-3 flex-1">
                                <motion.div 
                                    className="w-20 h-20 flex items-center justify-center"
                                    variants={iconAnimation}
                                >
                                    <img 
                                        src="/src/assets/icons/culture.png"
                                        alt="Culture Icon"
                                        className="w-full h-full object-contain"
                                    />
                                </motion.div>
                                <motion.h2 
                                    className="text-3xl font-bold text-white"
                                    variants={pageIndicatorAnimation}
                                >
                                    Cultura
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
                                    onClick={() => navigate('/')}
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
                    <div className="absolute inset-0 flex items-center justify-center pt-36 overflow-y-auto custom-scrollbar-blue">
                        <div className="w-[60%] flex flex-col items-center justify-center text-center pb-8">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentArticleIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="flex flex-col items-center bg-black/20 backdrop-blur-sm p-8 rounded-xl"
                                >
                                    <div
                                        className="relative w-[750px] h-[500px] mask-container cursor-pointer group mb-8"
                                        onClick={() => navigate(`/article/${currentArticleIndex}`)}
                                    >
                                        <svg className="w-full h-full">
                                            <defs>
                                                <mask id="mask">
                                                    <image
                                                        href="/src/assets/icons/mask.svg"
                                                        width="100%"
                                                        height="100%"
                                                        preserveAspectRatio="xMidYMid slice"
                                                    />
                                                </mask>
                                            </defs>
                                            <image
                                                href={currentArticle.images[0]}
                                                width="100%"
                                                height="100%"
                                                preserveAspectRatio="xMidYMid slice"
                                                mask="url(#mask)"
                                                className="transition-all duration-300 group-hover:brightness-[0.6] rounded-lg"
                                            />
                                        </svg>
                                        
                                        {/* Texto de "Click para leer más" */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <p className="text-white text-2xl font-bold bg-black/40 px-6 py-3 rounded-lg backdrop-blur-sm">
                                                Click para leer más
                                            </p>
                                        </div>
                                    </div>

                                    <h1 className="text-4xl font-bold mb-6">{currentArticle.title}</h1>
                                    <p className="text-lg mb-8">{currentArticle.content.slice(0, 200)}...</p>

                                    {/* Indicadores del carrusel */}
                                    <div className="flex justify-center gap-2">
                                        {articles.map((_, index) => (
                                            <motion.button
                                                key={index}
                                                onClick={() => handleDotClick(index)}
                                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                                    index === currentArticleIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                                                }`}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Flechas de navegación */}
                    <motion.div
                        className="absolute left-32 top-1/2 transform -translate-y-1/2 cursor-pointer z-20 bg-black/30 p-4 rounded-full backdrop-blur-sm hover:bg-black/50 transition-all"
                        onClick={handlePreviousArticle}
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
                        onClick={handleNextArticle}
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