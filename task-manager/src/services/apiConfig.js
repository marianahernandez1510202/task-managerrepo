// apiConfig.js - Configuración básica de la API
export const API_BASE_URL = 'https://task-manager-back-pl79.onrender.com/api/';

// Configuración de opciones por defecto para las peticiones API
export const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  }
};

// Función para obtener headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...defaultOptions.headers,
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export default {
  API_BASE_URL,
  defaultOptions,
  getAuthHeaders
};