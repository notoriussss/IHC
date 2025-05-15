import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getForumData, subscribeToForumChanges, type ForumData } from '@/services/forumService';

const pageTransition = {
    initial: {
        opacity: 0,
        scale: 0.8,
        x: '-100%',
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
    },
    exit: {
        opacity: 0,
        y: '100%',
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const overlayTransition = {
    initial: {
        background: 'radial-gradient(circle at top left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        opacity: 0
    },
    animate: {
        background: 'radial-gradient(circle at top left, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)',
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

export function Forum() {
    const navigate = useNavigate();
    const [forumData, setForumData] = useState<ForumData>(() => getForumData());

    useEffect(() => {
        const unsubscribe = subscribeToForumChanges((newData) => {
            setForumData(newData);
        });

        return () => unsubscribe();
    }, []);

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
                    className="relative w-full h-full flex flex-col text-white"
                    variants={contentAnimation}
                    style={{
                        backgroundImage: "url('/src/assets/background/background-forum.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        overflow: 'auto'
                    }}
                >
                    {/* Barra superior con logo */}
                    <div className="absolute top-5 w-full flex items-center px-8 z-20">
                        {/* Contenedor del ícono y título en la esquina superior izquierda */}
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="w-20 h-20 flex items-center justify-center"
                                variants={iconAnimation}
                            >
                                <img 
                                    src="/src/assets/icons/forum.png"
                                    alt="Forum Icon"
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>
                            <motion.div 
                                className="flex items-center"
                                variants={pageIndicatorAnimation}
                            >
                                <h2 className="text-3xl font-bold text-white">
                                    Foro
                                </h2>
                            </motion.div>
                        </div>

                        <motion.div
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
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

                    {/* Contenido del foro */}
                    <div className="flex flex-1 pt-32">
                        {/* Sección principal */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {forumData.posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    onClick={() => navigate(`/post/${post.id}`, { state: { from: 'forum' } })}
                                    className="p-4 rounded-lg mb-4 shadow-md hover:shadow-lg transition-shadow bg-transparent cursor-pointer hover:bg-black/20"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                                    <p className="text-sm text-gray-300 mb-2">{post.content}</p>
                                    <div className="text-sm text-gray-400">
                                        Publicado por <span className="font-bold">{post.author}</span> · {post.comments.length} comentarios
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Panel lateral derecho */}
                        <div className="w-80 p-4 bg-transparent border-l border-white">
                            <h2 className="text-xl font-bold mb-4 border-b border-white pb-2">Temas recientes</h2>
                            <ul>
                                {forumData.recentTopics.map((topic) => (
                                    <motion.li
                                        key={topic.id}
                                        onClick={() => navigate(`/post/${topic.id}`, { state: { from: 'forum' } })}
                                        className="mb-3 p-2 rounded-lg transition-colors cursor-pointer border-t border-white hover:bg-black"
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <h3 className="text-sm font-bold">{topic.title}</h3>
                                        <p className="text-xs text-gray-400">{topic.comments} comentarios</p>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}