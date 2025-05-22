import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PostItem, Categories, NewDiscussionForm, PostDetailPage } from './components';
import { useAuth } from './context';
import { getAllPosts, createPost, initializeForumData } from './services/forumService';
import AuthTabs from './components/auth/AuthTabs/AuthTabs';
import { SuccessMessageProvider, useSuccessMessage } from './context/SuccessMessageContext';
import { Post } from './types/forum';

// Inicializar los datos del foro
initializeForumData();

const categoryLabels: { [key: string]: string } = {
  'general': 'General',
  'pueblos': 'Nuestros Pueblos',
  'contaminacion': 'Contaminación',
  'economia': 'Economía',
  'proyectos': 'Proyectos',
  'turismo': 'Turismo'
};

const MainForumContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { showSuccessMessage } = useSuccessMessage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [avatarColor, setAvatarColor] = useState<string>('#0149FF');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      // Generar un color basado en el username para que sea consistente
      const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1'];
      const index = user.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      setAvatarColor(colors[index % colors.length]);
    }
  }, [isAuthenticated, user]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPosts();
      setPosts(data);
      setFilteredPosts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Error al cargar los posts. Por favor, intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Apply category filter first
    if (selectedCategory) {
      filtered = filtered.filter(post => 
        post.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Then apply search filter
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTermLower) ||
        post.content.toLowerCase().includes(searchTermLower) ||
        post.author.toLowerCase().includes(searchTermLower) ||
        post.category.toLowerCase().includes(searchTermLower)
      );
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStartDiscussion = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      setShowNewDiscussion(true);
    }
  };

  const handleNewDiscussionSubmit = async (title: string, content: string, category: string) => {
    if (!user) return;

    try {
      const newPost = await createPost({
        title,
        content,
        category,
        author: user.username
      });

      // Actualizar la lista de posts
      await fetchPosts();
      setShowNewDiscussion(false);
    } catch (error) {
      console.error('Error al crear el post:', error);
      throw error; // Propagar el error para que el formulario lo maneje
    }
  };

  const getUserInitial = () => {
    if (!user) return '';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          {isAuthenticated && user ? (
            <div className="user-profile">
              <div 
                className="user-avatar" 
                style={{ backgroundColor: avatarColor }}
              >
                {getUserInitial()}
              </div>
              <div className="user-menu">
                <span className="username">{user.username}</span>
                <button className="logout-button" onClick={logout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <i className="fas fa-user-circle" onClick={() => setShowAuthModal(true)}></i>
          )}
        </div>
        <div className="header-center">
          <input 
            type="text" 
            placeholder="Buscar posts..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="header-right">
        </div>
      </div>
      
      <div className="main-container">
        <div className="containerLeft">
          <div className="discution">
            <button type="button" onClick={handleStartDiscussion}>
              {isAuthenticated ? 'Comenzar Discusión' : 'Iniciar Sesión'}
            </button>
          </div>
          <hr />
          <Categories 
            onSelectCategory={setSelectedCategory} 
            selectedCategory={selectedCategory}
          />
        </div>

        <div className="listForos">
          <div className="posts-header">
            {selectedCategory && (
              <div className="active-filters">
                <span className="filter-tag">
                  {categoryLabels[selectedCategory.toLowerCase()] || selectedCategory}
                  <button onClick={() => setSelectedCategory(null)} className="clear-filter">
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              </div>
            )}
          </div>
          <div className="posts-container">
            {isLoading ? (
              <div className="loading-message">Cargando posts...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : filteredPosts.length === 0 ? (
              <div className="no-posts-message">
                {searchTerm ? 'No se encontraron posts que coincidan con la búsqueda' : 'No hay posts que coincidan con los filtros seleccionados'}
              </div>
            ) : (
              filteredPosts.map(post => (
                <PostItem 
                  key={post.id} 
                  post={post}
                />
              ))
            )}
          </div>
        </div>
      </div>

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

      {showNewDiscussion && (
        <NewDiscussionForm
          onClose={() => setShowNewDiscussion(false)}
          onSubmit={handleNewDiscussionSubmit}
        />
      )}
    </>
  );
};

const MainForum: React.FC = () => {
  return (
    <SuccessMessageProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<MainForumContent />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
          </Routes>
        </div>
      </Router>
    </SuccessMessageProvider>
  );
};

export default MainForum;
