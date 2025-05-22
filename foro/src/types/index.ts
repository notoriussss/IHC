export interface User {
  username: string;
  email: string;
  password?: string;
  favorites: number[];
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string | null;
  date: string;
  comments: number;
  favorite: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
} 