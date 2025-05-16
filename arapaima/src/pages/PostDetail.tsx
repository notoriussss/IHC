import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getForumData, updateForumData, subscribeToForumChanges, getUserVotes, votePost, type Post, type Comment } from '@/services/forumService';
import React from 'react';

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
    const [replyContents, setReplyContents] = useState<Record<number, string>>({});
    const [userVotes, setUserVotes] = useState(() => getUserVotes());
    
    const [post, setPost] = useState<Post | null>(() => {
        const currentData = getForumData();
        return currentData.posts.find(p => p.id === Number(id)) || null;
    });

    useEffect(() => {
        const unsubscribe = subscribeToForumChanges((newData) => {
            const updatedPost = newData.posts.find(p => p.id === Number(id));
            setPost(updatedPost || null);
            setUserVotes(getUserVotes());
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

    const ReplyInput = React.memo(({ commentId }: { commentId: number }) => {
        const [localContent, setLocalContent] = useState('');
        
        const handleSubmit = () => {
            if (!localContent.trim()) return;
            handleAddReply(commentId, localContent);
            setLocalContent('');
        };

        return (
            <div className="mt-2 mb-4">
                <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    className="w-full h-32 min-h-[8rem] max-h-32 p-3 bg-black/30 rounded text-white mb-4 resize-none"
                    placeholder="¿Qué piensas sobre esto?"
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setReplyingTo(null);
                            setLocalContent('');
                        }}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={!localContent.trim()}
                    >
                        Responder
                    </button>
                </div>
            </div>
        );
    });

    const handleAddComment = () => {
        if (!newComment.trim() || !post) return;

        const currentData = getForumData();
        const newCommentObj = {
            id: Math.max(0, ...post.comments.map(c => c.id)) + 1,
            author: "Usuario Actual",
            content: newComment,
            createdAt: new Date().toISOString(),
            replies: []
        };

        const updatedPost = {
            ...post,
            comments: [...post.comments, newCommentObj]
        };

        const updatedData = {
            ...currentData,
            posts: currentData.posts.map(p => p.id === post.id ? updatedPost : p)
        };

        updateForumData(updatedData);
        setNewComment('');
    };

    const handleAddReply = (commentId: number, content: string) => {
        if (!content.trim() || !post) return;

        const newReply = {
            id: Math.max(0, ...post.comments.flatMap(c => [c.id, ...(c.replies?.map(r => r.id) || [])])) + 1,
            author: "Usuario Actual",
            content: content,
            createdAt: new Date().toISOString()
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
        setReplyingTo(null);
        setReplyContents(prev => ({ ...prev, [commentId]: '' }));
    };

    const handleVote = (commentId: number | null, isUpvote: boolean, isMainPost: boolean = false) => {
        if (!post || !isMainPost) return; // Solo permitir votos en el post principal

        const voteType = isUpvote ? 'up' : 'down';
        const targetId = post.id;

        if (votePost(targetId, voteType)) {
            setUserVotes(getUserVotes());
        }
    };

    const handleReplyChange = React.useCallback((commentId: number, value: string) => {
        setReplyContents(prev => ({
            ...prev,
            [commentId]: value
        }));
    }, []);

    const handleCancelReply = React.useCallback((commentId: number) => {
        setReplyingTo(null);
        setReplyContents(prev => ({ ...prev, [commentId]: '' }));
    }, []);

    const handleToggleReply = React.useCallback((commentId: number) => {
        setReplyingTo(prev => prev === commentId ? null : commentId);
    }, []);

    const ReplyBox = React.memo(({ commentId }: { commentId: number }) => (
        <div className="mt-2 mb-4">
            <textarea
                value={replyContents[commentId] || ''}
                onChange={(e) => handleReplyChange(commentId, e.target.value)}
                className="w-full h-24 min-h-[6rem] max-h-24 p-2 bg-black/30 rounded text-sm text-white resize-none"
                placeholder="Escribe tu respuesta..."
            />
            <div className="flex justify-end gap-2 mt-2">
                <button
                    onClick={() => handleCancelReply(commentId)}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => handleAddReply(commentId, replyContents[commentId] || '')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!replyContents[commentId]?.trim()}
                >
                    Responder
                </button>
            </div>
        </div>
    ));

    const VoteButtons = ({ commentId, upvotes, downvotes, isMainPost = false }: { commentId: number | null, upvotes: number, downvotes: number, isMainPost?: boolean }) => {
        const currentVote = userVotes[post?.id || -1];
        
        if (!isMainPost) {
            return null;
        }

        return (
            <div className="flex flex-col items-center gap-1 mr-4">
                <button 
                    onClick={() => handleVote(commentId, true, isMainPost)}
                    className={`text-gray-400 hover:text-orange-500 transition-colors ${
                        currentVote === 'up' ? '!text-orange-500' : ''
                    }`}
                    aria-label="Me gusta"
                >
                    ▲
                </button>
                <span className="text-sm font-bold">{upvotes - downvotes}</span>
                <button 
                    onClick={() => handleVote(commentId, false, isMainPost)}
                    className={`text-gray-400 hover:text-blue-500 transition-colors ${
                        currentVote === 'down' ? '!text-blue-500' : ''
                    }`}
                    aria-label="No me gusta"
                >
                    ▼
                </button>
            </div>
        );
    };

    // Componente reutilizable para inputs de comentarios
    const CommentInput = React.memo(({ 
        value, 
        onChange, 
        onSubmit, 
        onCancel,
        placeholder = "Escribe tu respuesta...",
        submitText = "Responder",
        minHeight = "6rem"
    }: {
        value: string;
        onChange: (value: string) => void;
        onSubmit: () => void;
        onCancel?: () => void;
        placeholder?: string;
        submitText?: string;
        minHeight?: string;
    }) => (
        <div className="mt-2 mb-4">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full p-3 bg-black/30 rounded text-white resize-none`}
                style={{ minHeight }}
                placeholder={placeholder}
            />
            <div className="flex justify-end gap-2 mt-2">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    onClick={onSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!value.trim()}
                >
                    {submitText}
                </button>
            </div>
        </div>
    ));

    const CommentComponent = React.memo(({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => {
        const isReplying = replyingTo === comment.id;

        return (
            <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-200 mb-2 whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>
                    {!isReply && (
                        <>
                            <div className="flex gap-4 mb-2">
                                <button
                                    onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                                    className="text-xs text-gray-400 hover:text-white"
                                >
                                    {isReplying ? 'Cancelar' : 'Responder'}
                                </button>
                            </div>
                            {isReplying && <ReplyInput commentId={comment.id} />}
                        </>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-4 mt-4 border-l-2 border-gray-700 pl-4">
                            {comment.replies.map((reply) => (
                                <CommentComponent key={reply.id} comment={reply} isReply={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    });

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
        <AnimatePresence mode="wait">
            <motion.div
                className="fixed inset-0"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageTransition}
            >
                <motion.div
                    className="relative w-full h-full flex flex-col text-white overflow-y-auto custom-scrollbar-blue"
                    style={{
                        backgroundImage: "url('/src/assets/background/background-forum.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Barra superior con ícono y título */}
                    <div className="sticky top-0 left-0 right-0 bg-black/40 backdrop-blur-md z-50 py-5">
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
                    <div className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
                        {/* Contenido del post */}
                        <div className="bg-black/20 rounded-lg backdrop-blur-sm">
                            <div className="p-6 flex">
                                <VoteButtons commentId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} isMainPost={true} />
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl font-bold mb-2 break-words">{post.title}</h1>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                        <span>Publicado por</span>
                                        <span className="font-bold">{post.author}</span>
                                        <span>•</span>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>
                                    <div className="text-lg text-gray-200 whitespace-pre-wrap break-words">
                                        {post.content}
                                    </div>
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
        </AnimatePresence>
    );
}