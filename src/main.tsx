import React from 'react'
import ReactDOM from 'react-dom/client' 
import App from './App'
import { AuthProvider } from './context'

// Limpiar localStorage para asegurar datos frescos
localStorage.clear();

// Inicializar datos de ejemplo
localStorage.setItem('forum_users', JSON.stringify([]));
localStorage.setItem('forum_comments', JSON.stringify([]));

// Inicializar posts con todas las categorías
const initialPosts = [
  {
    id: 1,
    title: 'Impacto del Cambio Climático en Nuestra Región',
    date: '2024-05-13',
    category: 'contaminacion',
    comments: 0,
    content: 'El cambio climático está afectando significativamente nuestra región...',
    favorite: false,
    author: 'admin'
  },
  {
    id: 2,
    title: 'Desarrollo Económico Sostenible',
    date: '2024-05-10',
    category: 'economia',
    comments: 0,
    content: 'Explorando estrategias para un crecimiento económico responsable...',
    favorite: false,
    author: 'admin'
  },
  {
    id: 3,
    title: 'Tradiciones de Nuestro Pueblo',
    date: '2024-05-15',
    category: 'pueblos',
    comments: 0,
    content: 'Descubriendo las ricas tradiciones de nuestra comunidad...',
    favorite: false,
    author: 'admin'
  },
  {
    id: 4,
    title: 'Nuevo Proyecto Comunitario',
    date: '2024-05-14',
    category: 'proyectos',
    comments: 0,
    content: 'Iniciando un nuevo proyecto para mejorar nuestra comunidad...',
    favorite: false,
    author: 'admin'
  },
  {
    id: 5,
    title: 'Anuncio General del Foro',
    date: '2024-05-16',
    category: 'general',
    comments: 0,
    content: 'Bienvenidos a nuestro foro comunitario...',
    favorite: false,
    author: 'admin'
  }
];

localStorage.setItem('forum_posts', JSON.stringify(initialPosts));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)