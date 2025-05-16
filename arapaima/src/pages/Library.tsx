import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import libraryData from '@/data/library.json'; // Importamos los datos de los libros

// Componente de pincelada SVG para la máscara
const BrushStrokeMask = () => (
    <motion.path
        d="M30,50 Q45,30 50,50 T70,50"
        stroke="white"
        strokeWidth="80"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ 
            pathLength: 1,
            transition: {
                duration: 1,
                ease: "easeInOut",
                delay: 0.2
            }
        }}
    />
);

const pageTransition = {
    initial: {
        opacity: 0,
        scale: 0.8,
        x: '-100%',
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

const overlayTransition = {
    initial: {
        background: 'radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        opacity: 0
    },
    animate: {
        background: 'radial-gradient(circle at bottom left, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)',
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


export function Library() {
    const navigate = useNavigate();
    const [centerBook, setCenterBook] = useState(libraryData[0]); // Estado para el libro en el enmascarador superior
    const bottomCenterBook = libraryData[0]; // Libro central inferior fijo

    // Dividimos los libros en tres secciones
    const leftBooks = libraryData.slice(1, 5); // Libros para el contenedor izquierdo
    const rightBooks = libraryData.slice(5, 9); // Libros para el contenedor derecho

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
                    className="absolute inset-0 "
                    variants={overlayTransition}
                />
                
                <motion.div
                    className="relative w-full h-full flex flex-col items-center justify-start text-white"
                    variants={contentAnimation}
                    style={{
                        backgroundImage: "url('/src/assets/background/background-library.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        overflow: 'hidden'
                    }}
                >
                    {/* Barra superior con logo */}
                    <div className="stiky top-5 pt-5 w-full flex items-center px-8 z-20">
                        {/* Contenedor del ícono y título en la esquina superior izquierda */}
                        <div className="flex items-center gap-3 flex-1">
                            <motion.div 
                                className="w-20 h-20 flex items-center justify-center"
                                variants={iconAnimation}
                            >
                                <img 
                                    src="/src/assets/icons/library.png"
                                    alt="Library Icon"
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>
                            <motion.h2 
                                className="text-3xl font-bold text-white"
                                variants={pageIndicatorAnimation}
                            >
                                Biblioteca
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

                    {/* Contenido de la biblioteca */}
                    <div className="flex-1 w-full overflow-y-auto flex flex-col items-center justify-center ">
                        {/* Máscara superior central con sinopsis */}
                        <div className="flex items-center justify-center gap-4 my-4">
                            {/* Máscara superior central */}
                            
                            <motion.div
                                className="relative w-[250px] h-[350px] pt-10"
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                key={centerBook.title}
                            >
                                <svg className="w-full h-full">
                                    <defs>
                                        <mask id="mask-library">
                                            <image
                                                href="/src/assets/icons/mask-library.svg"
                                                width="100%"
                                                height="100%"
                                                preserveAspectRatio="xMidYMid meet"
                                            />
                                            {/* Agregamos la pincelada a la máscara */}
                                            <motion.svg width="100%" height="100%" viewBox="0 0 100 100">
                                                <BrushStrokeMask />
                                            </motion.svg>
                                        </mask>
                                    </defs>
                                    <motion.image
                                        href={centerBook.images[0]}
                                        width="100%"
                                        height="100%"
                                        preserveAspectRatio="xMidYMid slice"
                                        mask="url(#mask-library)"
                                        initial={{ scale: 1.1, opacity: 0 }}
                                        animate={{ 
                                            scale: 1,
                                            opacity: 1,
                                            transition: {
                                                duration: 0.5,
                                                ease: "easeOut",
                                                delay: 0.3 // Delay mayor que la pincelada
                                            }
                                        }}
                                    />
                                </svg>
                            </motion.div>
                                        
                            {/* Contenedor de la sinopsis */}
                            <div className="w-[250px] pt-10 text-left"> {/* Reducimos el ancho */}
                                <h2 className="text-xl font-bold mb-2">{centerBook.title}</h2> {/* Reducimos el tamaño del texto */}
                                <p className="text-base leading-relaxed mb-2">
                                    {centerBook.content || 'Sinopsis no disponible.'}
                                </p>
                                <a
                                    href={centerBook.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold underline text-sm" // Reducimos el tamaño del enlace
                                >
                                    {centerBook.url}
                                </a>
                            </div>
                        </div>

                        {/* Contenedor principal para la librería */}
                        <div className="flex items-center justify-center gap-2"> {/* Aumentamos el espacio entre los contenedores */}
                            {/* Contenedor izquierdo */}
                            <div className="grid grid-cols-2 gap-6"> {/* Aumentamos el espacio entre libros */}
                                {leftBooks.map((book, index) => (
                                    <motion.div
                                        key={index}
                                        className="relative w-[150px] h-[180px] cursor-pointer"
                                        onClick={() => setCenterBook(book)} // Actualizar el libro central superior
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                    >
                                        <svg className="w-full h-full">
                                            <defs>
                                                <mask id={`mask-left-${index}`}>
                                                    <image
                                                        href="/src/assets/icons/library-left.svg"
                                                        width="100%"
                                                        height="100%"
                                                        preserveAspectRatio="xMidYMid meet"
                                                    />
                                                </mask>
                                            </defs>
                                            <image
                                                href={book.images[0]} // Imagen del libro
                                                width="100%"
                                                height="100%"
                                                preserveAspectRatio="xMidYMid slice"
                                                mask={`url(#mask-left-${index})`}
                                            />
                                        </svg>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Elemento central inferior */}
                            <motion.div
                                className="relative w-[250px] h-[400px] cursor-pointer"
                                onClick={() => setCenterBook(bottomCenterBook)} // Actualizar el libro central superior al hacer clic
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                                <svg className="w-full h-full">
                                    <defs>
                                        <mask id="mask-center">
                                            <image
                                                href="/src/assets/icons/library-center.svg"
                                                width="100%"
                                                height="100%"
                                                preserveAspectRatio="xMidYMid meet"
                                            />
                                        </mask>
                                    </defs>
                                    <image
                                        href={bottomCenterBook.images[0]} // Imagen del libro central inferior
                                        width="100%"
                                        height="100%"
                                        preserveAspectRatio="xMidYMid slice"
                                        mask="url(#mask-center)"
                                    />
                                </svg>
                            </motion.div>

                            {/* Contenedor derecho */}
                            <div className="grid grid-cols-2 gap-6"> {/* Aumentamos el espacio entre libros */}
                                {rightBooks.map((book, index) => (
                                    <motion.div
                                        key={index}
                                        className="relative w-[150px] h-[180px] cursor-pointer"
                                        onClick={() => setCenterBook(book)} // Actualizar el libro central superior
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                    >
                                        <svg className="w-full h-full">
                                            <defs>
                                                <mask id={`mask-right-${index}`}>
                                                    <image
                                                        href="/src/assets/icons/library-right.svg"
                                                        width="100%"
                                                        height="100%"
                                                        preserveAspectRatio="xMidYMid meet"
                                                    />
                                                </mask>
                                            </defs>
                                            <image
                                                href={book.images[0]} // Imagen del libro
                                                width="100%"
                                                height="100%"
                                                preserveAspectRatio="xMidYMid slice"
                                                mask={`url(#mask-right-${index})`}
                                            />
                                        </svg>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}