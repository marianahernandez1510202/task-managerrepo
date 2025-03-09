// apiClient.js - Cliente para realizar peticiones API
import axios from 'axios';
import { API_BASE_URL, defaultOptions, getAuthHeaders } from './apiConfig';

// Crea una instancia de axios con la configuración base
const createClient = (useAuth = true) => {
  const headers = useAuth ? getAuthHeaders() : defaultOptions.headers;
  
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers
  });

  // Interceptor para manejar errores de forma global
  instance.interceptors.response.use(
    response => response,
    error => {
      // Si el error es 401 (no autorizado), podemos manejar la redirección al login
      if (error.response && error.response.status === 401) {
        console.error('Sesión expirada o inválida');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Funciones para realizar peticiones HTTP
const apiClient = {
  // Crear cliente personalizado (útil para casos especiales)
  create: (useAuth = true) => createClient(useAuth),
  
  // Peticiones estándar
  get: (endpoint, useAuth = true) => {
    const client = createClient(useAuth);
    return client.get(endpoint);
  },
  
  post: (endpoint, data, useAuth = true) => {
    const client = createClient(useAuth);
    return client.post(endpoint, data);
  },
  
  put: (endpoint, data, useAuth = true) => {
    const client = createClient(useAuth);
    return client.put(endpoint, data);
  },
  
  patch: (endpoint, data, useAuth = true) => {
    const client = createClient(useAuth);
    return client.patch(endpoint, data);
  },
  
  delete: (endpoint, useAuth = true) => {
    const client = createClient(useAuth);
    return client.delete(endpoint);
  }
};

export default apiClient;