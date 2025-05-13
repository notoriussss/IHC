import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import articles from '@/data/data.json';

const pageTransition = {
    initial: {
        x: '100%',
        opacity: 0
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        x: '100%',
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const overlayTransition = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3
        }
    }
};

export function ArticleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = articles[parseInt(id || '0')];

    const handleBack = () => {
        navigate('/culture', { state: { from: 'article-detail' } });
    };

    if (!article) {
        return <p>Artículo no encontrado</p>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="article-detail"
                className="fixed inset-0"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageTransition}
            >
                <motion.div
                    className="absolute inset-0"
                    variants={overlayTransition}
                />
                
                <motion.div
                    className="relative w-full h-full flex flex-col text-white"
                    style={{
                        backgroundImage: "url('/src/assets/background/background-culture.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        overflow: 'auto'
                    }}
                >
                    {/* Barra superior con logo */}
                    <div className="absolute top-5 w-full flex items-center justify-between px-8 z-20">
                        {/* Contenedor del ícono y título */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="text-white font-bold hover:scale-105 transition-transform"
                            >
                                ← Volver
                            </button>
                        </div>

                        {/* Logo centrado */}
                        <motion.div
                            className="cursor-pointer"
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        >
                            <img
                                src="/src/assets/logo/logo.svg"
                                alt="Logo"
                                className="w-60 h-auto"
                                style={{ userSelect: 'none' }}
                            />
                        </motion.div>

                        {/* Div vacío para mantener el logo centrado */}
                        <div className="w-[200px]"></div>
                    </div>

                    {/* Contenedor principal */}
                    <div className="absolute inset-0 flex items-center justify-center pt-32">
                        <div className="w-[90%] max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Columna izquierda */}
                            <div className="flex flex-col gap-6">
                                {/* Título */}
                                <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>

                                {/* Imágenes */}
                                <div className="flex flex-col gap-4">
                                    {article.images.map((image, index) => (
                                        <motion.img
                                            key={index}
                                            src={image}
                                            alt={`Imagen ${index + 1}`}
                                            className="w-full h-[400px] object-cover rounded-lg shadow-md"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    ))}
                                </div>

                                {/* Fuente */}
                                <motion.a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-4 font-bold"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Leer más en la fuente original
                                </motion.a>
                            </div>

                            {/* Columna derecha */}
                            <div className="flex flex-col gap-4 text-xl leading-loose">
                                {article.content.split('\n').map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className={index === 0 ? 'first-letter:text-6xl first-letter:font-bold first-letter:mr-2 first-letter:float-left' : ''}
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}