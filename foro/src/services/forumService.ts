import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Interfaces
export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

// Funciones para posts
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get<Post[]>(`${API_URL}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getPostById = async (id: number): Promise<Post | null> => {
  try {
    const response = await axios.get<Post>(`${API_URL}/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>): Promise<Post | null> => {
  try {
    const response = await axios.post<Post>(`${API_URL}/posts`, post);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

export const updatePost = async (id: number, post: Partial<Post>): Promise<Post | null> => {
  try {
    const response = await axios.put<Post>(`${API_URL}/posts/${id}`, post);
    return response.data;
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    return null;
  }
};

export const deletePost = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/posts/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    return false;
  }
};

// Funciones para comentarios
export const getComments = async (postId: number): Promise<Comment[]> => {
  try {
    const response = await axios.get<Comment[]>(`${API_URL}/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
};

export const createComment = async (postId: number, comment: Omit<Comment, 'id' | 'postId' | 'createdAt' | 'updatedAt'>): Promise<Comment | null> => {
  try {
    const response = await axios.post<Comment>(`${API_URL}/posts/${postId}/comments`, comment);
    return response.data;
  } catch (error) {
    console.error(`Error creating comment for post ${postId}:`, error);
    return null;
  }
};

export const updateComment = async (postId: number, commentId: number, comment: Partial<Comment>): Promise<Comment | null> => {
  try {
    const response = await axios.put<Comment>(`${API_URL}/posts/${postId}/comments/${commentId}`, comment);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    return null;
  }
};

export const deleteComment = async (postId: number, commentId: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/posts/${postId}/comments/${commentId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    return false;
  }
};

// Funciones para favoritos
export const getUserFavoritePosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get<Post[]>(`${API_URL}/favorites`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite posts:', error);
    return [];
  }
};

export const addPostToFavorites = async (postId: number): Promise<boolean> => {
  try {
    await axios.post(`${API_URL}/favorites/${postId}`);
    return true;
  } catch (error) {
    console.error(`Error adding post ${postId} to favorites:`, error);
    return false;
  }
};

export const removePostFromFavorites = async (postId: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/favorites/${postId}`);
    return true;
  } catch (error) {
    console.error(`Error removing post ${postId} from favorites:`, error);
    return false;
  }
};

// Función para inicializar datos del foro
export const initializeForumData = async (): Promise<boolean> => {
  try {
    const posts = await getAllPosts();
    if (posts.length === 0) {
      // Aquí podrías agregar lógica para inicializar datos por defecto si es necesario
      console.log('No posts found, initializing forum data...');
    }
    return true;
  } catch (error) {
    console.error('Error initializing forum data:', error);
    return false;
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

