import { Post, Comment } from '../types/forum';

const POSTS_STORAGE_KEY = 'forum_posts';
const COMMENTS_STORAGE_KEY = 'forum_comments';

// Inicializar el localStorage con los datos del JSON si no existen
const initializeData = () => {
  // Inicializar posts
  const storedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
  if (!storedPosts) {
    fetch('/data/posts.json')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(data.posts));
      })
      .catch(error => {
        console.error('Error al cargar posts iniciales:', error);
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify([]));
      });
  }

  // Inicializar comentarios
  const storedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!storedComments) {
    fetch('/data/coments.json')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(data.comments));
      })
      .catch(error => {
        console.error('Error al cargar comentarios iniciales:', error);
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify([]));
      });
  }
};

// Inicializar al cargar el módulo
initializeData();

// Funciones auxiliares para posts
const getPosts = (): Post[] => {
  const posts = localStorage.getItem(POSTS_STORAGE_KEY);
  return posts ? JSON.parse(posts) : [];
};

const savePosts = (posts: Post[]): boolean => {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.error('Error al guardar posts:', error);
    return false;
  }
};

// Funciones auxiliares para comentarios
const getComments = (postId: number): Comment[] => {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    console.log('Obteniendo comentarios del post:', {
      postId,
      post,
      comments: post?.comments || []
    });
    return post?.comments || [];
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return [];
  }
};

// Funciones exportadas
export const getAllPosts = async (): Promise<Post[]> => {
  const posts = getPosts();
  // Asegurarnos de que todos los posts tengan un array de comentarios
  return posts.map(post => ({
    ...post,
    comments: post.comments || []
  }));
};

export const getPostById = async (id: number): Promise<Post | null> => {
  const posts = getPosts();
  const post = posts.find(post => post.id === id);
  if (post) {
    // Asegurarnos de que el post siempre tenga un array de comentarios
    if (!post.comments) {
      post.comments = [];
    }
    return post;
  }
  return null;
};

export const createPost = async (postData: Omit<Post, 'id' | 'date' | 'comments'>): Promise<Post> => {
  const posts = getPosts();
  const newPost: Post = {
    id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
    ...postData,
    date: new Date().toISOString(),
    comments: []
  };
  
  posts.push(newPost);
  savePosts(posts);
  return newPost;
};

export const createComment = async (commentData: Omit<Comment, 'id' | 'date'>): Promise<Comment> => {
  try {
    console.log('Creando nuevo comentario:', commentData);
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === commentData.postId);
    
    if (postIndex === -1) {
      throw new Error('Post no encontrado');
    }

    // Asegurarnos de que el post tenga un array de comentarios
    if (!posts[postIndex].comments) {
      posts[postIndex].comments = [];
    }

    // Generar nuevo ID para el comentario
    const currentComments = posts[postIndex].comments;
    const newId = currentComments.length > 0 ? Math.max(...currentComments.map(c => c.id)) + 1 : 1;
    
    const newComment: Comment = {
      id: newId,
      ...commentData,
      date: new Date().toISOString()
    };

    console.log('Nuevo comentario creado:', newComment);

    // Agregar comentario al post
    posts[postIndex].comments.push(newComment);
    const saved = savePosts(posts);
    
    if (!saved) {
      throw new Error('Error al guardar el comentario');
    }

    console.log('Comentario guardado exitosamente');
    return newComment;
  } catch (error) {
    console.error('Error en createComment:', error);
    throw error;
  }
};

export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  try {
    console.log('Obteniendo comentarios para el post:', postId);
    const comments = getComments(postId);
    console.log('Comentarios encontrados:', comments);
    return comments;
  } catch (error) {
    console.error('Error al obtener comentarios del post:', error);
    return [];
  }
};
