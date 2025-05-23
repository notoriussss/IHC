import { Post, Comment } from '../types/forum';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface PostsResponse {
  posts: Post[];
}

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get<PostsResponse>(`${API_URL}/posts`);
    return response.data.posts;
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
};

export const getPostById = async (id: number): Promise<Post> => {
  try {
    const response = await axios.get<Post>(`${API_URL}/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Post no encontrado');
  }
};

interface CreatePostData {
  title: string;
  content: string;
  author: string;
  category: string;
}

export const createPost = async (postData: CreatePostData): Promise<Post> => {
  try {
    const response = await axios.post<Post>(`${API_URL}/posts`, postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Error al crear el post');
  }
};

interface CreateCommentData {
  content: string;
  author: string;
}

export const createComment = async (postId: number, commentData: CreateCommentData): Promise<Comment> => {
  try {
    const response = await axios.post<Comment>(`${API_URL}/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Error al crear el comentario');
  }
};

export const getComments = async (postId: number): Promise<Comment[]> => {
  try {
    const response = await axios.get<Comment[]>(`${API_URL}/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
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

