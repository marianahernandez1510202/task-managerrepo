// services/authService.js
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://task-manager-back-pl79.onrender.com/api' 
  : 'http://localhost:5000/api';

  const TOKEN_KEY = 'token';
const USER_KEY = 'user_info';


const authService = {
  // Iniciar sesión con email y password como parámetros separados
  login: async (email, password) => {
    try {
      console.log('Enviando solicitud de login con:', { email, password });
      
      // Asegurarse de enviar email y password como propiedades directas del objeto
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error en login:', error.response?.data || error);
      throw error;
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Registrar un nuevo usuario
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Error en register:', error.response?.data || error);
      throw error;
    }
  },

  // Obtener el token actual
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Obtener la información del usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si hay un usuario autenticado
  isLoggedIn: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Verificar si el usuario actual es superadmin
  isSuperAdmin: () => {
    const user = authService.getCurrentUser();
    return user ? user.role === 'superadmin' : false;
  }
};

export default authService;