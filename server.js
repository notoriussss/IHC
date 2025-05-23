import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const USERS_FILE = path.join(__dirname, 'src', 'data', 'usuarios.json');
const POSTS_FILE = path.join(__dirname, 'src', 'data', 'posts.json');
const COMMENTS_FILE = path.join(__dirname, 'src', 'data', 'coments.json');

// Asegurarse de que los archivos existen
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify({ posts: [] }, null, 2), 'utf8');
}

if (!fs.existsSync(COMMENTS_FILE)) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify({ comments: [] }, null, 2), 'utf8');
}

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor del foro funcionando correctamente');
});

// Leer usuarios
app.get('/api/users', (req, res) => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error al leer usuarios:', error);
    res.status(500).json({ error: 'Error al leer usuarios' });
  }
});

// Guardar usuarios
app.post('/api/users', (req, res) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
    res.status(500).json({ error: 'Error al guardar usuarios' });
  }
});

// Ruta para verificar el estado del servidor
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Función auxiliar para leer el archivo JSON de posts
async function readPostsFile() {
  try {
    const data = await fs.promises.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer posts:', error);
    return { posts: [] };
  }
}

// Función auxiliar para escribir en el archivo JSON de posts
async function writePostsFile(data) {
  try {
    await fs.promises.writeFile(POSTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al escribir posts:', error);
    throw error;
  }
}

// Obtener todos los posts
app.get('/api/posts', async (req, res) => {
  try {
    const data = await readPostsFile();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ error: 'Error al leer los posts' });
  }
});

// Obtener un post por ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const data = await readPostsFile();
    const post = data.posts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({ error: 'Error al leer el post' });
  }
});

// Crear un nuevo post
app.post('/api/posts', async (req, res) => {
  try {
    const data = await readPostsFile();
    const newPost = {
      id: data.posts.length > 0 ? Math.max(...data.posts.map(p => p.id)) + 1 : 1,
      ...req.body,
      date: new Date().toISOString(),
      comments: []
    };
    data.posts.push(newPost);
    await writePostsFile(data);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ error: 'Error al crear el post' });
  }
});

// Agregar un comentario a un post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const data = await readPostsFile();
    const postIndex = data.posts.findIndex(p => p.id === parseInt(req.params.id));
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    const newComment = {
      id: data.posts[postIndex].comments.length + 1,
      postId: parseInt(req.params.id),
      ...req.body,
      date: new Date().toISOString()
    };

    data.posts[postIndex].comments.push(newComment);
    await writePostsFile(data);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear el comentario' });
  }
});

// Función auxiliar para leer el archivo JSON de comentarios
async function readCommentsFile() {
  try {
    const data = await fs.promises.readFile(COMMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer comentarios:', error);
    return { comments: [] };
  }
}

// Función auxiliar para escribir en el archivo JSON de comentarios
async function writeCommentsFile(data) {
  try {
    await fs.promises.writeFile(COMMENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al escribir comentarios:', error);
    throw error;
  }
}

// Obtener comentarios de un post
app.get('/api/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const data = await readCommentsFile();
    const comments = data.comments.filter(comment => comment.postId === parseInt(postId));
    res.json(comments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: 'Error al leer los comentarios' });
  }
});

// Crear un nuevo comentario
app.post('/api/comments', async (req, res) => {
  try {
    // Primero actualizamos el post con el nuevo comentario
    const postsData = await readPostsFile();
    const postIndex = postsData.posts.findIndex(p => p.id === req.body.postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    const newComment = {
      id: postsData.posts[postIndex].comments.length + 1,
      postId: req.body.postId,
      content: req.body.content,
      author: req.body.author,
      date: new Date().toISOString()
    };

    // Agregar el comentario al post
    postsData.posts[postIndex].comments.push(newComment);
    await writePostsFile(postsData);

    // También guardamos en el archivo de comentarios
    const commentsData = await readCommentsFile();
    commentsData.comments.push(newComment);
    await writeCommentsFile(commentsData);

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear el comentario' });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Frontend corriendo en http://localhost:5173`);
  }
}); 
