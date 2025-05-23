import { Post, Comment } from '../types/forum';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    return response.data.posts;
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
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
    const posts = await getAllPosts();
    if (posts.length === 0) {
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

