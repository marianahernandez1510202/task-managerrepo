// groupService.js
import axios from 'axios';
import authService from './authService';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://task-manager-back-pl79.onrender.com/api' 
  : 'http://localhost:5000/api';

// Configuración para incluir el token en las peticiones
const authAxios = () => {
  const token = authService.getToken();
  return axios.create({
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

const groupService = {
  // Obtener todos los grupos
  getAllGroups: async () => {
    try {
      const response = await authAxios().get(`${API_URL}/groups`);
      return response.data;
    } catch (error) {
      console.error('Error en getAllGroups:', error.response?.data || error);
      throw error;
    }
  },

  // Crear un nuevo grupo
  createGroup: async (groupData) => {
    try {
      const response = await authAxios().post(`${API_URL}/groups`, groupData);
      return response.data;
    } catch (error) {
      console.error('Error en createGroup:', error.response?.data || error);
      throw error;
    }
  },

  // Actualizar un grupo existente
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await authAxios().put(`${API_URL}/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      console.error('Error en updateGroup:', error.response?.data || error);
      throw error;
    }
  },

  // Eliminar un grupo
  deleteGroup: async (groupId) => {
    try {
      const response = await authAxios().delete(`${API_URL}/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteGroup:', error.response?.data || error);
      throw error;
    }
  },

  // Agregar estudiantes a un grupo
  addStudentsToGroup: async (groupId, studentIds) => {
    try {
      const response = await authAxios().post(`${API_URL}/groups/${groupId}/students`, {
        studentIds: studentIds
      });
      return response.data;
    } catch (error) {
      console.error('Error en addStudentsToGroup:', error.response?.data || error);
      throw error;
    }
  },

  // Eliminar un estudiante de un grupo
  removeStudentFromGroup: async (groupId, studentId) => {
    try {
      const response = await authAxios().delete(`${API_URL}/groups/${groupId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error en removeStudentFromGroup:', error.response?.data || error);
      throw error;
    }
  },

  // Crear una tarea en un grupo
  createTaskInGroup: async (groupId, taskData) => {
    try {
      const response = await authAxios().post(`${API_URL}/groups/${groupId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error en createTaskInGroup:', error.response?.data || error);
      throw error;
    }
  },

  // Obtener tareas de un grupo
  getGroupTasks: async (groupId) => {
    try {
      const response = await authAxios().get(`${API_URL}/groups/${groupId}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Error en getGroupTasks:', error.response?.data || error);
      throw error;
    }
  }
};

export default groupService;