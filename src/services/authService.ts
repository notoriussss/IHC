import { User } from '../types/forum';

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

const USERS_STORAGE_KEY = 'forum_users';

// Inicializar el localStorage con los usuarios del JSON solo si está completamente vacío
const initializeUsers = async () => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    console.log('Estado inicial de localStorage:', { storedUsers });
    
    // Solo inicializar si no hay usuarios guardados
    if (!storedUsers || storedUsers === '[]') {
      console.log('Inicializando usuarios por primera vez');
      try {
        const response = await fetch('/data/usuarios.json');
        if (!response.ok) {
          throw new Error('Error al cargar usuarios iniciales');
        }
        const initialUsers = await response.json();
        console.log('Usuarios iniciales cargados:', initialUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      } catch (error) {
        console.error('Error al cargar usuarios iniciales:', error);
        // Inicializar con un array vacío si hay error
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
      }
    } else {
      console.log('Usuarios existentes encontrados, no se requiere inicialización');
    }
  } catch (error) {
    console.error('Error en initializeUsers:', error);
  }
};

// Inicializar al cargar el módulo
initializeUsers().catch(console.error);

// Función auxiliar para obtener usuarios
const getUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    console.log('Contenido de localStorage:', {
      key: USERS_STORAGE_KEY,
      value: storedUsers
    });
    
    if (!storedUsers) {
      console.log('No hay usuarios almacenados en localStorage');
      return [];
    }
    
    const users = JSON.parse(storedUsers);
    console.log('Usuarios parseados:', users);
    return users;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

// Función auxiliar para guardar usuarios
const saveUsers = (users: User[]): boolean => {
  try {
    console.log('Guardando usuarios:', users);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
    return false;
  }
};

export const login = async (username: string, password: string): Promise<User | null> => {
  try {
    console.log('Intentando login para:', { username, password });
    const users = getUsers();
    console.log('Usuarios disponibles para login:', users);
    
    // Verificar si hay usuarios
    if (users.length === 0) {
      console.log('No hay usuarios registrados en el sistema');
      return null;
    }

    // Buscar el usuario
    const user = users.find(u => {
      console.log('Comparando usuario:', {
        stored: u.username,
        trying: username,
        passwordMatch: u.password === password
      });
      return u.username === username && u.password === password;
    });
    
    if (!user) {
      console.log('Usuario no encontrado o contraseña incorrecta');
      return null;
    }

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    console.log('Login exitoso para:', username);
    return userWithoutPassword;
  } catch (error) {
    console.error('Error de login:', error);
    return null;
  }
};

// Función para verificar si un usuario existe
export const checkUserExists = (username: string): boolean => {
  const users = getUsers();
  return users.some(u => u.username === username);
};

export const register = async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
  try {
    const users = getUsers();
    console.log('Registrando nuevo usuario:', userData.username);
    
    // Verificar si el usuario o email ya existe
    if (checkUserExists(userData.username)) {
      console.log('Usuario ya existe:', userData.username);
      return {
        success: false,
        message: 'El nombre de usuario ya está en uso'
      };
    }
    
    if (users.some(u => u.email === userData.email)) {
      console.log('Email ya existe:', userData.email);
      return {
        success: false,
        message: 'El correo electrónico ya está registrado'
      };
    }

    // Crear nuevo usuario
    const newUser = {
      ...userData,
      favorites: [],
      dateCreated: new Date().toISOString() // Agregamos fecha de creación
    };

    // Guardar en localStorage
    users.push(newUser);
    const saved = saveUsers(users);
    
    if (!saved) {
      console.log('Error al guardar usuario');
      return {
        success: false,
        message: 'Error al guardar el usuario'
      };
    }

    // Verificar que el usuario se guardó correctamente
    const verifyUser = checkUserExists(userData.username);
    if (!verifyUser) {
      console.error('Error: Usuario no se guardó correctamente');
      return {
        success: false,
        message: 'Error al verificar el registro'
      };
    }

    console.log('Usuario registrado exitosamente:', userData.username);
    return {
      success: true,
      message: 'Registro exitoso',
      user: {
        username: newUser.username,
        email: newUser.email,
        favorites: [],
        dateCreated: newUser.dateCreated
      }
    };
  } catch (error) {
    console.error('Error de registro:', error);
    return {
      success: false,
      message: 'Error al registrar usuario'
    };
  }
};

export const getCurrentUser = async (username: string): Promise<User | null> => {
  try {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};