// services/userService.js
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'https://task-manager-back-pl79.onrender.com/';

// Función para obtener el token del localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const userService = {
  // Obtener todos los usuarios (para superadmin)
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/all`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error en getAllUsers:', error.response?.data || error);
      throw error;
    }
  },

  // Obtener todos los estudiantes
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${API_URL}/users?role=student`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error en getAllStudents:', error.response?.data || error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error en createUser:', error.response?.data || error);
      throw error;
    }
  },

  // Actualizar un usuario existente
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}`, userData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error en updateUser:', error.response?.data || error);
      throw error;
    }
  },

  // Eliminar un usuario
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error en deleteUser:', error.response?.data || error);
      throw error;
    }
  },

  // Cambiar contraseña de un usuario
  changePassword: async (userId, newPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}/users/${userId}/change-password`, 
        { password: newPassword }, 
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error en changePassword:', error.response?.data || error);
      throw error;
    }
  },

  // Obtener perfil del usuario actual
  getUserProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error en getUserProfile:', error.response?.data || error);
      throw error;
    }
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (userData) => {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, userData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error en updateProfile:', error.response?.data || error);
      throw error;
    }
  },

  // Cambiar contraseña del usuario actual
  changeOwnPassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}/users/change-password`, 
        { currentPassword, newPassword }, 
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error en changeOwnPassword:', error.response?.data || error);
      throw error;
    }
  }
};

export default userService;