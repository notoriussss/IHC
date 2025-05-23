export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  postId: number;
  content: string;
  author: string;
  date: string;
}

export interface User {
  username: string;
  email: string;
  password?: string;
  favorites?: number[];
} 