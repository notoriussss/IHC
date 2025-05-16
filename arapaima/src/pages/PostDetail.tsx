import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getForumData, updateForumData, subscribeToForumChanges, type Post, type Comment } from '@/services/forumService';

const pageTransitionFromForum = {
    initial: {
        opacity: 0,
        y: '100%'
    },
    animate: {
        opacity: 1,
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

const defaultTransition = {
    initial: { clipPath: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)' },
    animate: { clipPath: 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)' },
    exit: { clipPath: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)' },
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

export function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isFromForum = location.state?.from === 'forum';
    const pageTransition = isFromForum ? pageTransitionFromForum : defaultTransition;
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    
    const [post, setPost] = useState<Post | null>(() => {
        const currentData = getForumData();
        return currentData.posts.find(p => p.id === parseInt(id || '0')) || null;
    });

    useEffect(() => {
        const unsubscribe = subscribeToForumChanges((newData) => {
            const updatedPost = newData.posts.find(p => p.id === parseInt(id || '0')) || null;
            setPost(updatedPost);
        });

        return () => unsubscribe();
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAddComment = () => {
        if (!newComment.trim() || !post) return;

        const newCommentObj = {
            id: Math.max(0, ...post.comments.map(c => c.id)) + 1,
            author: "Usuario Actual",
            content: newComment,
            createdAt: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
            replies: []
        };

        const updatedPost = {
            ...post,
            comments: [...post.comments, newCommentObj]
        };

        const currentData = getForumData();
        const updatedData = {
            ...currentData,
            posts: currentData.posts.map(p => p.id === post.id ? updatedPost : p)
        };

        updateForumData(updatedData);
        setNewComment('');
    };

    const handleAddReply = (commentId: number) => {
        if (!replyContent.trim() || !post) return;

        const newReply = {
            id: Math.max(0, ...post.comments.flatMap(c => [c.id, ...(c.replies?.map(r => r.id) || [])])) + 1,
            author: "Usuario Actual",
            content: replyContent,
            createdAt: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0
        };

        const updatedComments = post.comments.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply]
                };
            }
            return comment;
        });

        const updatedPost = {
            ...post,
            comments: updatedComments
        };

        const currentData = getForumData();
        const updatedData = {
            ...currentData,
            posts: currentData.posts.map(p => p.id === post.id ? updatedPost : p)
        };

        updateForumData(updatedData);
        setReplyContent('');
        setReplyingTo(null);
    };

    const VoteButtons = ({ upvotes, downvotes }: { upvotes: number; downvotes: number }) => (
        <div className="flex flex-col items-center gap-1 mr-4">
            <button className="text-gray-400 hover:text-orange-500">▲</button>
            <span className="text-sm font-bold">{upvotes - downvotes}</span>
            <button className="text-gray-400 hover:text-blue-500">▼</button>
        </div>
    );

    const CommentComponent = ({ comment }: { comment: Comment }) => (
        <div className="flex gap-4">
            <VoteButtons upvotes={comment.upvotes} downvotes={comment.downvotes} />
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-200 mb-2">{comment.content}</p>
                <div className="flex gap-4 mb-2">
                    <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs text-gray-400 hover:text-white"
                    >
                        Responder
                    </button>
                </div>
                {replyingTo === comment.id && (
                    <div className="mt-2 mb-4">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full h-24 min-h-[6rem] max-h-24 p-2 bg-black/30 rounded text-sm text-white resize-none"
                            placeholder="Escribe tu respuesta..."
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleAddReply(comment.id)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Responder
                            </button>
                        </div>
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4 mt-4 border-l-2 border-gray-700 pl-4">
                        {comment.replies.map((reply) => (
                            <CommentComponent key={reply.id} comment={reply} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const handleNavigateBack = () => {
        navigate('/forum', { state: { from: 'post' } });
    };

    if (!post) {
        return (
            <motion.div
                className="min-h-screen flex items-center justify-center text-white"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageTransition}
                transition={{ duration: 0.5 }}
                style={{
                    backgroundImage: "url('/src/assets/background/background-forum.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    userSelect: 'none',
                }}
            >
                <h1 className="text-2xl font-bold">Post no encontrado</h1>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="fixed inset-0"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <motion.div
                className="relative w-full h-full flex flex-col text-white"
                style={{
                    backgroundImage: "url('/src/assets/background/background-forum.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    overflow: 'auto'
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
                                    src="/src/assets/icons/forum.png"
                                    alt="Forum Icon"
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>
                            <motion.h2 
                                className="text-3xl font-bold text-white"
                                variants={pageIndicatorAnimation}
                            >
                                Foro
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

                {/* Contenedor principal */}
                <div className="flex-1 max-w-4xl mx-auto px-6 py-8 pt-36">
                    {/* Contenido del post */}
                    <div className="bg-black/20 rounded-lg backdrop-blur-sm">
                        <div className="p-6 flex">
                            <VoteButtons upvotes={post.upvotes} downvotes={post.downvotes} />
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                    <span>Publicado por</span>
                                    <span className="font-bold">{post.author}</span>
                                    <span>•</span>
                                    <span>{formatDate(post.createdAt)}</span>
                                </div>
                                <div className="text-lg text-gray-200">{post.content}</div>
                            </div>
                        </div>

                        {/* Formulario para añadir comentario */}
                        <div className="border-t border-gray-700 p-6">
                            <h3 className="text-lg font-bold mb-4">Añadir un comentario</h3>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full h-32 min-h-[8rem] max-h-32 p-3 bg-black/30 rounded text-white mb-4 resize-none"
                                placeholder="¿Qué piensas sobre esto?"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddComment}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    disabled={!newComment.trim()}
                                >
                                    Comentar
                                </button>
                            </div>
                        </div>

                        {/* Sección de comentarios */}
                        <div className="border-t border-gray-700">
                            <div className="p-6">
                                <h2 className="text-lg font-bold mb-6">
                                    {post.comments.length} Comentarios
                                </h2>
                                <div className="space-y-6">
                                    {post.comments.map((comment) => (
                                        <CommentComponent key={comment.id} comment={comment} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}