const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, '../src/data/users.json');

// Leer usuarios
const getUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

// Guardar usuarios
const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.json({ success: false, message: 'Usuario no encontrado' });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.json({ success: false, message: 'Contraseña incorrecta' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// Registro
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  const users = getUsers();

  if (users.some(u => u.username === username)) {
    return res.json({ 
      success: false, 
      message: 'El nombre de usuario ya está en uso' 
    });
  }

  if (users.some(u => u.email === email)) {
    return res.json({ 
      success: false, 
      message: 'El email ya está registrado' 
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    username,
    email,
    password: hashedPassword,
    favorites: []
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ 
    success: true, 
    message: 'Usuario registrado exitosamente',
    user: userWithoutPassword
  });
});

// Obtener usuario
app.get('/api/auth/user/:username', (req, res) => {
  const { username } = req.params;
  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.json({ success: false, message: 'Usuario no encontrado' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
