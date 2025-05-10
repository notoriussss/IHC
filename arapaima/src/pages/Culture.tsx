import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import articles from '@/data/data.json'; // Importamos el JSON con los datos

const rightToLeftVariants = {
    initial: { clipPath: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)' },
    animate: { clipPath: 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)' },
    exit: { clipPath: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)' },
};

// Variantes para la animación de cambio de artículo
const articleVariants = {
    initial: { opacity: 0, x: 100 }, // Comienza transparente y desplazado a la derecha
    animate: { opacity: 1, x: 0 }, // Aparece y se centra
    exit: { opacity: 0, x: -100 }, // Desaparece desplazándose a la izquierda
};

export function Culture() {
    const navigate = useNavigate();
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0); // Estado para el artículo actual

    // Función para cambiar al artículo anterior
    const handlePreviousArticle = () => {
        setCurrentArticleIndex((prevIndex) =>
            prevIndex === 0 ? articles.length - 1 : prevIndex - 1
        );
    };

    // Función para cambiar al siguiente artículo
    const handleNextArticle = () => {
        setCurrentArticleIndex((prevIndex) =>
            prevIndex === articles.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Datos del artículo actual
    const currentArticle = articles[currentArticleIndex];

    return (
        <motion.div
            className="relative w-full h-screen bg-[#3BA100] flex items-center justify-center text-white"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={rightToLeftVariants}
            transition={{ duration: 0.5 }}
            style={{
                backgroundImage: "url('/src/assets/background/background-culture.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                userSelect: 'none',
            }}
        >
            {/* Logo para volver a la página principal */}
            <div
                className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
                onClick={() => navigate('/')}
            >
                <img
                    src="/src/assets/logo/logo.svg"
                    alt="Logo"
                    className="w-80 h-auto"
                    style={{ userSelect: 'none' }}
                />
            </div>

            {/* Contenedor del carrusel */}
            <div className="relative flex flex-col items-center justify-center text-center p-8 w-[60%]" style={{ top: '50px' }}>
                <motion.div
                    key={currentArticleIndex} // Cambia la clave para que AnimatePresence detecte el cambio
                    variants={articleVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div
                        className="relative w-[750px] h-[500px] mask-container cursor-pointer"
                        onClick={() => navigate(`/article/${currentArticleIndex}`)} // Navegar al detalle del artículo
                    >
                        {/* Imagen con máscara aplicada */}
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
                            />
                        </svg>
                    </div>

                    {/* Título y categoría */}
                    <h1 className="text-3xl font-bold mt-6">{currentArticle.title}</h1>
                    <p className="text-lg mt-2">{currentArticle.label}</p>
                </motion.div>

                {/* Indicadores del carrusel */}
                <div className="flex justify-center gap-2 mt-6">
                    {articles.map((_, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 rounded-full ${index === currentArticleIndex ? 'bg-white' : 'bg-gray-500'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Flecha izquierda */}
            <motion.div
                className="absolute left-10 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={handlePreviousArticle}
                whileHover={{ scale: 1.2 }} // Efecto de ampliación al hacer hover
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <motion.img
                    src="/src/assets/icons/arrow-left.svg"
                    alt="Flecha izquierda"
                    className="w-12 h-12"
                    whileHover={{ opacity: 0 }} // Oculta la flecha normal al hacer hover
                    transition={{ duration: 0.2 }}
                />
                <motion.img
                    src="/src/assets/icons/arrow-left-hover.svg"
                    alt="Flecha izquierda hover"
                    className="w-12 h-12 absolute top-0 left-0"
                    initial={{ opacity: 0 }} // Comienza oculta
                    whileHover={{ opacity: 1 }} // Muestra la flecha hover al hacer hover
                    transition={{ duration: 0.2 }}
                />
            </motion.div>

            {/* Flecha derecha */}
            <motion.div
                className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={handleNextArticle}
                whileHover={{ scale: 1.2 }} // Efecto de ampliación al hacer hover
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <motion.img
                    src="/src/assets/icons/arrow-right.svg"
                    alt="Flecha derecha"
                    className="w-12 h-12"
                    whileHover={{ opacity: 0 }} // Oculta la flecha normal al hacer hover
                    transition={{ duration: 0.2 }}
                />
                <motion.img
                    src="/src/assets/icons/arrow-right-hover.svg"
                    alt="Flecha derecha hover"
                    className="w-12 h-12 absolute top-0 left-0"
                    initial={{ opacity: 0 }} // Comienza oculta
                    whileHover={{ opacity: 1 }} // Muestra la flecha hover al hacer hover
                    transition={{ duration: 0.2 }}
                />
            </motion.div>
        </motion.div>
    );
}