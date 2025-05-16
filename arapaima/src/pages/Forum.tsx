import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getForumData, subscribeToForumChanges, getUserVotes, votePost, updateForumData, type ForumData } from '@/services/forumService';

const getPageTransition = (from: string | undefined) => {
    if (from === 'post') {
        return {
            initial: {
                opacity: 0,
                scale: 0.8,
                y: '100%'
            },
            animate: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1]
                }
            },
            exit: {
                opacity: 0,
                y: '-100%',
                transition: {
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1]
                }
            }
        };
    }

    // Transición por defecto (cuando entramos desde App.tsx - diagonal)
    return {
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
            y: '-100%',
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };
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
    const location = useLocation();
    const from = location.state?.from;
    const pageTransition = getPageTransition(from);
    const [forumData, setForumData] = useState<ForumData>(() => getForumData());
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [userVotes, setUserVotes] = useState(() => getUserVotes());
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        label: 'Debate'
    });

    useEffect(() => {
        const unsubscribe = subscribeToForumChanges((newData) => {
            setForumData(newData);
            setUserVotes(getUserVotes());
        });

        return () => unsubscribe();
    }, []);

    // Get unique labels from posts
    const labels = Array.from(new Set(forumData.posts.map(post => post.label)));

    // Filter posts based on selected label
    const filteredPosts = selectedLabel
        ? forumData.posts.filter(post => post.label === selectedLabel)
        : forumData.posts;

    const handleVote = (e: React.MouseEvent, postId: number, voteType: 'up' | 'down') => {
        e.stopPropagation(); // Prevenir navegación al post
        if (votePost(postId, voteType)) {
            setUserVotes(getUserVotes());
        }
    };

    const handleCreatePost = () => {
        if (!newPost.title.trim() || !newPost.content.trim()) return;

        const currentData = getForumData();
        const newPostObj = {
            id: Math.max(0, ...currentData.posts.map(p => p.id)) + 1,
            title: newPost.title,
            content: newPost.content,
            author: "Usuario Actual",
            createdAt: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
            label: newPost.label,
            comments: []
        };

        const updatedData = {
            ...currentData,
            posts: [newPostObj, ...currentData.posts]
        };

        updateForumData(updatedData);
        setNewPost({ title: '', content: '', label: 'Debate' });
        setIsNewPostModalOpen(false);
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="fixed inset-0"
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
                    className="relative w-full h-full flex flex-col text-white overflow-y-auto custom-scrollbar-blue"
                    variants={contentAnimation}
                    style={{
                        backgroundImage: "url('/src/assets/background/background-forum.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Barra superior con logo - Ahora fixed */}
                    <div className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md z-50 py-5">
                        <div className="flex items-center px-8">
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
                    </div>

                    {/* Modal para nuevo post */}
                    {isNewPostModalOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl mx-4">
                                <h2 className="text-2xl font-bold mb-4">Crear nuevo post</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Título</label>
                                        <input
                                            type="text"
                                            value={newPost.title}
                                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                            className="w-full p-2 bg-black/30 rounded text-white"
                                            placeholder="Escribe un título..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Contenido</label>
                                        <textarea
                                            value={newPost.content}
                                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                            className="w-full h-48 p-2 bg-black/30 rounded text-white resize-none"
                                            placeholder="Escribe el contenido..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Etiqueta</label>
                                        <select
                                            value={newPost.label}
                                            onChange={(e) => setNewPost({ ...newPost, label: e.target.value })}
                                            className="w-full p-2 bg-black/30 rounded text-white"
                                        >
                                            <option value="Debate">Debate</option>
                                            <option value="Literatura">Literatura</option>
                                            <option value="Eventos">Eventos</option>
                                            <option value="Metodología">Metodología</option>
                                            <option value="Recursos">Recursos</option>
                                            <option value="Noticias">Noticias</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button
                                            onClick={() => setIsNewPostModalOpen(false)}
                                            className="px-4 py-2 text-gray-400 hover:text-white"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleCreatePost}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            disabled={!newPost.title.trim() || !newPost.content.trim()}
                                        >
                                            Publicar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contenido del foro */}
                    <div className="flex flex-col items-center w-full min-h-full pt-32 pb-16">
                        {/* Filtros de etiquetas y botón nuevo post */}
                        <div className="w-3/4 mb-6 flex items-center justify-between sticky top-32 bg-black/40 backdrop-blur-md p-4 rounded-lg z-40">
                            <div className="flex flex-wrap gap-2 items-center">
                                <button
                                    onClick={() => setSelectedLabel(null)}
                                    className={`px-4 py-2 rounded-full transition-colors ${
                                        selectedLabel === null
                                            ? 'bg-white text-black'
                                            : 'bg-black/20 text-white hover:bg-black/40'
                                    }`}
                                >
                                    Todos ({forumData.posts.length})
                                </button>
                                {labels.map((label) => {
                                    const count = forumData.posts.filter(post => post.label === label).length;
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => setSelectedLabel(label)}
                                            className={`px-4 py-2 rounded-full transition-colors ${
                                                selectedLabel === label
                                                    ? 'bg-white text-black'
                                                    : 'bg-black/20 text-white hover:bg-black/40'
                                            }`}
                                        >
                                            {label} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {/* Botón de nuevo post */}
                            <button
                                onClick={() => setIsNewPostModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ml-4"
                            >
                                <span>✏️</span>
                                <span>Nuevo Post</span>
                            </button>
                        </div>

                        {/* Sección principal */}
                        <div className="w-3/4 space-y-4">
                            {filteredPosts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    onClick={() => navigate(`/post/${post.id}`, { state: { from: 'forum' } })}
                                    className="p-6 w-full rounded-lg shadow-md hover:shadow-lg transition-all bg-black/20 backdrop-blur-sm cursor-pointer hover:bg-black/40"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-2xl font-bold">{post.title}</h2>
                                        <span className="px-4 py-1 bg-white/10 rounded-full text-sm font-medium">
                                            {post.label}
                                        </span>
                                    </div>
                                    <p className="text-base text-gray-300 mb-4 line-clamp-3">{post.content}</p>
                                    <div className="flex justify-between items-center text-sm text-gray-400">
                                        <span>
                                            Publicado por <span className="font-bold">{post.author}</span>
                                        </span>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleVote(e, post.id, 'up')}
                                                    className={`p-1 rounded transition-colors ${
                                                        userVotes[post.id] === 'up'
                                                            ? 'text-orange-500'
                                                            : 'hover:text-orange-500'
                                                    }`}
                                                >
                                                    ▲
                                                </button>
                                                <span>{post.upvotes - post.downvotes}</span>
                                                <button
                                                    onClick={(e) => handleVote(e, post.id, 'down')}
                                                    className={`p-1 rounded transition-colors ${
                                                        userVotes[post.id] === 'down'
                                                            ? 'text-blue-500'
                                                            : 'hover:text-blue-500'
                                                    }`}
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>💬</span>
                                                <span>{post.comments.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}