// services/personalTaskService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Función para obtener el token del localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const personalTaskService = {
  // Obtener todas las tareas personales del usuario
  getAllTasks: async () => {
    try {
      const response = await axios.get(`${API_URL}/personal-tasks`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al obtener tareas personales:', error.response?.data || error);
      throw error;
    }
  },

  // Crear una nueva tarea personal
  createTask: async (taskData) => {
    try {
      const response = await axios.post(`${API_URL}/personal-tasks`, taskData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al crear tarea personal:', error.response?.data || error);
      throw error;
    }
  },

  // Actualizar una tarea personal existente
  updateTask: async (taskId, taskData) => {
    try {
      const response = await axios.put(`${API_URL}/personal-tasks/${taskId}`, taskData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al actualizar tarea personal:', error.response?.data || error);
      throw error;
    }
  },

  // Eliminar una tarea personal
  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`${API_URL}/personal-tasks/${taskId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al eliminar tarea personal:', error.response?.data || error);
      throw error;
    }
  },

  // Cambiar estado de completado de una tarea
  toggleTaskCompletion: async (taskId) => {
    try {
      const response = await axios.post(`${API_URL}/personal-tasks/${taskId}/toggle-complete`, {}, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error.response?.data || error);
      throw error;
    }
  }
};

export default personalTaskService;