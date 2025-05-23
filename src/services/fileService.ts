const API_URL = 'http://localhost:3001/api';

export const readJsonFile = async (filename: string) => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Error al leer usuarios');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error al leer el archivo ${filename}:`, error);
    return null;
  }
};

export const writeJsonFile = async (filename: string, data: any) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Error al guardar usuarios');
    }
    
    return true;
  } catch (error) {
    console.error(`Error al escribir en el archivo ${filename}:`, error);
    return false;
  }
}; 