export const endpoints = {
    // Autenticación
    auth: {
      login: 'login',
      register: 'register',
      profile: 'auth/profile'
    },
    
    // Grupos
    groups: {
      getAll: 'groups',
      getById: (id) => `groups/${id}`,
      create: 'groups',
      update: (id) => `groups/${id}`,
      delete: (id) => `groups/${id}`,
      addStudents: (id) => `groups/${id}/students`,
      removeStudent: (id, studentId) => `groups/${id}/students/${studentId}`,
      getTasks: (id) => `groups/${id}/tasks`,
      createTask: (id) => `groups/${id}/tasks`
    },
    
    // Usuarios
    users: {
      getAll: 'users',
      getStudents: 'users?role=student',
      getById: (id) => `users/${id}`,
      create: 'users',
      update: (id) => `users/${id}`,
      delete: (id) => `users/${id}`
    },
    
    // Tareas
    tasks: {
      getAll: 'tasks',
      getById: (id) => `tasks/${id}`,
      update: (id) => `tasks/${id}`,
      delete: (id) => `tasks/${id}`
    }
  };
  
  export default endpoints;