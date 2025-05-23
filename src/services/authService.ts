import { User } from '../types/forum';
import { readJsonFile, writeJsonFile } from './fileService';

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

const USERS_FILE = 'usuarios.json';

// Inicializar el archivo de usuarios si no existe
const initializeUsersFile = async () => {
  const users = await readJsonFile(USERS_FILE);
  if (!users) {
    await writeJsonFile(USERS_FILE, []);
  }
};

// Inicializar al cargar el módulo
initializeUsersFile();

// Función auxiliar para guardar usuarios en el archivo JSON
const saveUsers = async (users: User[]) => {
  return await writeJsonFile(USERS_FILE, users);
};

export const login = async (username: string, password: string): Promise<User | null> => {
  try {
    // Obtener usuarios del archivo JSON
    const users = await readJsonFile(USERS_FILE) as User[] || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return null;
    }

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error de login:', error);
    return null;
  }
};

export const register = async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
  try {
    // Obtener usuarios existentes
    const users = await readJsonFile(USERS_FILE) as User[] || [];
    
    // Verificar si el usuario o email ya existe
    if (users.some(u => u.username === userData.username)) {
      return {
        success: false,
        message: 'El nombre de usuario ya está en uso'
      };
    }
    
    if (users.some(u => u.email === userData.email)) {
      return {
        success: false,
        message: 'El correo electrónico ya está registrado'
      };
    }

    // Crear nuevo usuario
    const newUser = {
      ...userData,
      favorites: []
    };

    // Guardar en el archivo JSON
    users.push(newUser);
    const saved = await saveUsers(users);
    
    if (!saved) {
      return {
        success: false,
        message: 'Error al guardar el usuario'
      };
    }

    return {
      success: true,
      message: 'Registro exitoso',
      user: {
        username: newUser.username,
        email: newUser.email,
        favorites: []
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
    const users = await readJsonFile(USERS_FILE) as User[] || [];
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