import { Post, Comment } from '../types/forum';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const COMMENTS_STORAGE_KEY = 'forum_comments';

// Función auxiliar para leer los posts
const readPosts = async (): Promise<{ posts: Post[] }> => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error reading posts:', error);
    return { posts: [] };
  }
};

// Función auxiliar para escribir posts
const writePosts = async (data: { posts: Post[] }): Promise<void> => {
  try {
    await axios.post(`${API_URL}/posts`, data);
  } catch (error) {
    console.error('Error writing posts:', error);
    throw new Error('Error al guardar los datos');
  }
};

// Función auxiliar para leer los comentarios
const readComments = async (): Promise<Comment[]> => {
  try {
    const comments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    return comments ? JSON.parse(comments) : [];
  } catch (error) {
    console.error('Error reading comments:', error);
    return [];
  }
};

// Función auxiliar para escribir comentarios
const writeComments = async (comments: Comment[]): Promise<void> => {
  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  } catch (error) {
    console.error('Error writing comments:', error);
    throw new Error('Error al guardar los comentarios');
  }
};

export const getAllPosts = async (): Promise<Post[]> => {
  const data = await readPosts();
  return data.posts;
};

export const getPostById = async (id: number): Promise<Post> => {
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Post no encontrado');
  }
};

export const createPost = async (postData: Omit<Post, 'id' | 'date' | 'comments'>): Promise<Post> => {
  try {
    const response = await axios.post(`${API_URL}/posts`, postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Error al crear el post');
  }
};

export const createComment = async (postId: number, content: string, author: string): Promise<Comment> => {
  try {
    const response = await axios.post(`${API_URL}/comments`, {
      postId,
      content,
      author
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Error al crear el comentario');
  }
};

// Función para inicializar algunos datos de ejemplo
export const initializeForumData = async () => {
  try {
    const data = await readPosts();
    if (data.posts.length === 0) {
      await createPost({
        title: 'Bienvenido al Foro',
        content: 'Este es un foro de ejemplo para discutir temas relacionados con la comunidad.',
        author: 'Admin',
        category: 'general'
      });
    }
  } catch (error) {
    console.error('Error initializing forum data:', error);
  }
};

export const getComments = async (postId: number): Promise<Comment[]> => {
  try {
    const response = await axios.get(`${API_URL}/posts/${postId}`);
    return response.data.comments || [];
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

export const getPost = async (postId: number): Promise<Post> => {
  const response = await fetch(`${API_URL}/posts/${postId}`);
  if (!response.ok) {
    throw new Error('Error al obtener el post');
  }
  return response.json();
};

export const addComment = async (comment: { postId: number; content: string; author: string }): Promise<Comment> => {
  const response = await fetch(`${API_URL}/posts/${comment.postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: comment.content, author: comment.author }),
  });

  if (!response.ok) {
    throw new Error('Error al agregar el comentario');
  }

  return response.json();
};

export const getUserFavoritePosts = async (userId: string): Promise<Post[]> => {
  const posts = await getAllPosts();
  return posts.filter(post => post.favorite);
};

export const toggleFavorite = async (postId: number): Promise<void> => {
  const posts = await getAllPosts();
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) return;
  
  const post = posts[postIndex];
  post.favorite = !post.favorite;
  
  localStorage.setItem('forum_posts', JSON.stringify(posts));
}; 