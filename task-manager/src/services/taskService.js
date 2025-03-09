// services/taskService.js
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

const taskService = {
  // Obtener tareas de un grupo
  getGroupTasks: async (groupId) => {
    try {
      const response = await axios.get(`${API_URL}/groups/${groupId}/tasks`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al obtener tareas del grupo:', error.response?.data || error);
      throw error;
    }
  },

  // Cambiar estado de completado de una tarea de grupo
  toggleTaskCompletion: async (taskId) => {
    try {
      const response = await axios.post(`${API_URL}/tasks/${taskId}/complete`, {}, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error.response?.data || error);
      throw error;
    }
  },

  // Obtener detalles de una tarea específica
  getTaskDetails: async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles de tarea:', error.response?.data || error);
      throw error;
    }
  },

  // Para superadmin: actualizar una tarea
  updateTask: async (taskId, taskData) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al actualizar tarea:', error.response?.data || error);
      throw error;
    }
  },

  // Para superadmin: eliminar una tarea
  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`${API_URL}/tasks/${taskId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error al eliminar tarea:', error.response?.data || error);
      throw error;
    }
  }
};

export default taskService;