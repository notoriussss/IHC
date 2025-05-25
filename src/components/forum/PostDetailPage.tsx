import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { getPostById, createComment, getCommentsByPostId } from '../../services/forumService';
import { useSuccessMessage } from '../../context/SuccessMessageContext';
import AuthTabs from '../auth/AuthTabs/AuthTabs';
import './PostDetailPage.css';

interface Comment {
  id: number;
  content: string;
  author: string;
  date: string;
  postId: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
}

const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    'general': 'fa-globe',
    'pueblos': 'fa-home',
    'contaminacion': 'fa-smog',
    'economia': 'fa-chart-line',
    'proyectos': 'fa-project-diagram',
    'turismo': 'fa-umbrella-beach'
  };
  return icons[category.toLowerCase()] || 'fa-folder';
};

const capitalizeFirstLetter = (str: string): string => {
  if (str.toLowerCase() === 'pueblos') {
    return 'Nuestros Pueblos';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showSuccessMessage } = useSuccessMessage();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const postData = await getPostById(parseInt(id));
        const commentsData = await getCommentsByPostId(parseInt(id));
        setPost(postData);
        setComments(commentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar el post. Por favor, intente más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !post) return;

    setIsSubmitting(true);
    try {
      const comment = await createComment({
        postId: post.id,
        content: newComment,
        author: user.username
      });
      setComments(prev => [...prev, comment]);
      setNewComment('');
      showSuccessMessage('Comentario publicado con éxito');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      setError('Error al publicar el comentario. Por favor, intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Cargando post...</div>;
  }

  if (error || !post) {
    return <div className="error-container">{error || 'Post no encontrado'}</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="post-detail-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
        <div className="post-category">
          <i className={`fas ${getCategoryIcon(post.category)}`}></i>
          {capitalizeFirstLetter(post.category)}
        </div>
      </div>

      <article className="post-detail">
        <h1 className="post-title">{post.title}</h1>
        
        <div className="post-meta">
          <span className="author">
            <i className="fas fa-user"></i> {post.author}
          </span>
          <span className="date">
            <i className="fas fa-calendar"></i> {new Date(post.date).toLocaleDateString()}
          </span>
        </div>

        <div className="post-content">
          {post.content}
        </div>
      </article>

      <section className="comments-section">
        <h2>Comentarios ({comments?.length ?? 0})</h2>
        
        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              disabled={isSubmitting}
              required
            />
            <button 
              type="submit" 
              className="submit-comment"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Comentario'}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Inicia sesión para comentar</p>
            <button onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}>Iniciar Sesión</button>
          </div>
        )}

        <div className="comments-list">
          {!comments || comments.length === 0 ? (
            <p className="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">
                    <i className="fas fa-user"></i> {comment.author}
                  </span>
                  <span className="comment-date">
                    {new Date(comment.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="comment-content">
                  {comment.content}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>
            <AuthTabs
              mode={authMode}
              onSuccess={() => setShowAuthModal(false)}
              onModeChange={setAuthMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;
