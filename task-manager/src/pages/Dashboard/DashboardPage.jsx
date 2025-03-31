// StudentDashboard.jsx - Componente actualizado con tareas por estado
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { ThemeContext } from '../../context/ThemeContext'; // Ajusta la ruta según tu estructura

import axios from 'axios';
import { 
  Card, List, Button, Tag, message, Modal, Tabs, Typography, Collapse, Badge, 
  Form, Input, DatePicker, Select, Space, Popconfirm, Empty, Row, Col, Divider,
  FloatButton, Radio
} from 'antd';
import { 
  CheckCircleOutlined, CheckCircleFilled, ClockCircleOutlined, LogoutOutlined,
  PlusOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/es';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [groups, setGroups] = useState([]);
  const [personalTasks, setPersonalTasks] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [personalTasksLoading, setPersonalTasksLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [personalTaskModalVisible, setPersonalTaskModalVisible] = useState(false);
  const [editingPersonalTask, setEditingPersonalTask] = useState(null);
  const [taskForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('groups');
  const [editingTaskStatus, setEditingTaskStatus] = useState(null);

  // Definimos los estados disponibles para las tareas
  const taskStatuses = [
    { value: 'In Progress', label: 'En Progreso' },
    { value: 'Done', label: 'Hecho' },
    { value: 'Paused', label: 'Pausado' },
    { value: 'Revision', label: 'Revisión' }
  ];

  const token = localStorage.getItem('token');
  const headers = { "Authorization": `Bearer ${token}` };
  const API_URL = 'https://task-manager-back-pl79.onrender.com/api';

  // Fetch groups assigned to the student
  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/student/groups`, { headers });
      setGroups(response.data);
      
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      message.error('Error al obtener los grupos');
    } finally {
      setGroupsLoading(false);
    }
  };

  // Fetch personal tasks
  const fetchPersonalTasks = async () => {
    setPersonalTasksLoading(true);
    try {
      const response = await axios.get(`${API_URL}/personal-tasks`, { headers });
      setPersonalTasks(response.data);
    } catch (error) {
      console.error('Error fetching personal tasks:', error);
      message.error('Error al obtener las tareas personales');
    } finally {
      setPersonalTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchPersonalTasks();
  }, []);

  // Toggle task completion status (for group tasks) - Versión corregida
  const handleToggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      console.log("Marcando tarea como completada: ", taskId, isCompleted);
      
      const response = await axios.post(`${API_URL}/tasks/${taskId}/complete`, {}, { headers });
      
      // Verificar la respuesta
      console.log("Respuesta del servidor:", response.data);
      
      if (response.data) {
        // Actualizar todas las tareas
        await fetchGroups();
        
        // Cerrar el modal
        setTaskModalVisible(false);
        
        message.success(isCompleted ? 'Tarea marcada como pendiente' : 'Tarea marcada como completada');
      } else {
        message.error('No se pudo actualizar el estado de la tarea');
      }
    } catch (error) {
      console.error('Error al marcar la tarea como completada:', error);
      message.error('Error al cambiar el estado de la tarea: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update task status - Versión optimizada para garantizar la actualización
 // Corregir la función handleUpdateTaskStatus
const handleUpdateTaskStatus = async (taskId, newStatus) => {
  try {
    // Mostrar mensaje de carga
    message.loading({ 
      content: `Actualizando estado a ${getStatusLabel(newStatus)}...`, 
      key: 'statusUpdate', 
      duration: 0 
    });
    
    console.log(`Enviando actualización de estado para tarea ${taskId}`);
    console.log(`Cuerpo de la petición:`, { status: newStatus });
    
    // Realizar la petición al servidor
    const response = await axios.put(
      `${API_URL}/tasks/${taskId}`, 
      { status: newStatus }, 
      { headers }
    );
    
    if (response.status === 200) {
      console.log("Actualización exitosa:", response.data);
      
      // Actualizar la tarea seleccionada en el estado
      if (response.data && response.data.task) {
        setSelectedTask({...response.data.task});
      } else {
        // Si no hay datos de tarea en la respuesta, actualizar manualmente
        if (selectedTask) {
          setSelectedTask(prev => ({
            ...prev,
            status: newStatus
          }));
        }
      }
      
      // Cerrar el selector de estado
      setEditingTaskStatus(null);
      
      // Mensaje de éxito
      message.success({ 
        content: `Tarea actualizada a estado: ${getStatusLabel(newStatus)}`, 
        key: 'statusUpdate' 
      });
      
      // Refrescar las tareas del grupo
      if (selectedGroup) {
        fetchGroups();
      }
    } else {
      throw new Error("La respuesta del servidor no fue exitosa");
    }
  } catch (error) {
    console.error('Error al actualizar el estado de la tarea:', error);
    
    // Mostrar mensaje de error
    message.error({ 
      content: 'Error al actualizar el estado de la tarea', 
      key: 'statusUpdate' 
    });
    
    // No cerrar el selector de estado para permitir otro intento
  }
};

  // Toggle personal task completion
  const handleTogglePersonalTaskCompletion = async (taskId, isCompleted) => {
    try {
      await axios.post(`${API_URL}/personal-tasks/${taskId}/toggle-complete`, {}, { headers });
      message.success(isCompleted ? 'Tarea marcada como pendiente' : 'Tarea marcada como completada');
      
      // Actualizar las tareas
      await fetchPersonalTasks();
    } catch (error) {
      console.error('Error toggling personal task completion:', error);
      message.error('Error al cambiar el estado de la tarea');
    }
  };

  // Create or update personal task
  const handleSavePersonalTask = async (values) => {
    try {
      const taskData = {
        ...values,
        dead_line: values.dead_line.format('YYYY-MM-DDTHH:mm:ss')
      };
      
      if (editingPersonalTask) {
        // Update existing task
        await axios.put(`${API_URL}/personal-tasks/${editingPersonalTask._id}`, taskData, { headers });
        message.success('Tarea personal actualizada exitosamente');
      } else {
        // Create new task
        await axios.post(`${API_URL}/personal-tasks`, taskData, { headers });
        message.success('Tarea personal creada exitosamente');
      }
      
      setPersonalTaskModalVisible(false);
      taskForm.resetFields();
      setEditingPersonalTask(null);
      fetchPersonalTasks();
    } catch (error) {
      console.error('Error saving personal task:', error);
      message.error('Error al guardar la tarea personal');
    }
  };

  // Update personal task status
  const handleUpdatePersonalTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API_URL}/personal-tasks/${taskId}`, 
        { status: newStatus }, 
        { headers }
      );
      
      message.success('Estado actualizado correctamente');
      fetchPersonalTasks();
    } catch (error) {
      console.error('Error updating personal task status:', error);
      message.error('Error al actualizar el estado de la tarea');
    }
  };

  // Delete personal task
  const handleDeletePersonalTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/personal-tasks/${taskId}`, { headers });
      message.success('Tarea personal eliminada exitosamente');
      fetchPersonalTasks();
    } catch (error) {
      console.error('Error deleting personal task:', error);
      message.error('Error al eliminar la tarea personal');
    }
  };

  // Logout and destroy token
  const handleDestroyToken = () => {
    try {
      // Eliminar token y datos del usuario del localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
  
      message.success("Sesión cerrada correctamente");
  
      // Redirigir al usuario a la página de login usando el hook navigate
      navigate('/login');
      
      // Cerrar el modal de confirmación
      setLogoutModalVisible(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      message.error("Error al cerrar la sesión");
    }
  };

  const showLogoutConfirm = () => {
    setLogoutModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'blue';
      case 'Done': return 'green';
      case 'Paused': return 'orange';
      case 'Revision': return 'red';
      default: return 'default';
    }
  };

  const getStatusLabel = (statusValue) => {
    const status = taskStatuses.find(s => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  // Check if a task has been completed by the current user
  const isTaskCompletedByMe = (task) => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    return task.completed_by && task.completed_by.some(entry => entry.student === userId);
  };

  // Open modal to create new personal task
  const showCreatePersonalTaskModal = () => {
    setEditingPersonalTask(null);
    taskForm.resetFields();
    taskForm.setFieldsValue({
      status: 'In Progress',
      dead_line: moment().add(1, 'days')
    });
    setPersonalTaskModalVisible(true);
  };

  // Open modal to edit personal task
  const showEditPersonalTaskModal = (task) => {
    setEditingPersonalTask(task);
    taskForm.setFieldsValue({
      name_task: task.name_task,
      description: task.description,
      dead_line: moment(task.dead_line),
      status: task.status,
      category: task.category
    });
    setPersonalTaskModalVisible(true);
  };

  // Agrupar tareas por categoría
  const groupTasksByCategory = (tasks) => {
    const grouped = {};
    
    tasks.forEach(task => {
      const category = task.category || 'Sin Categoría';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(task);
    });
    
    return grouped;
  };

  // Agrupar tareas por estado
  const groupTasksByStatus = (tasks) => {
    // Inicializar el objeto para todos los estados posibles
    const grouped = {};
    taskStatuses.forEach(status => {
      grouped[status.value] = [];
    });
    
    // Asignar cada tarea a su estado correspondiente
    tasks.forEach(task => {
      if (task.status && grouped[task.status] !== undefined) {
        grouped[task.status].push(task);
      } else {
        // Si el estado no está definido, asignar a "In Progress" por defecto
        grouped['In Progress'].push(task);
      }
    });
    
    return grouped;
  };

  const TaskCard = ({ task, isPersonal = false }) => {
    // For personal tasks, use the 'completed' field
    // For group tasks, check if completed by current user
    const completed = isPersonal ? task.completed : isTaskCompletedByMe(task);
    const deadlineDate = new Date(task.dead_line);
    const isPastDue = deadlineDate < new Date();
    
    // Función para manejar el cambio de estatus
    const handleStatusChange = () => {
      // Si es tarea personal
      if (isPersonal) {
        setEditingPersonalTask(task);
        taskForm.setFieldsValue({
          name_task: task.name_task,
          description: task.description,
          dead_line: moment(task.dead_line),
          status: task.status,
          category: task.category
        });
        setPersonalTaskModalVisible(true);
      } else {
        // Si es tarea de grupo, abrimos el modal con esta tarea
        setSelectedTask(task);
        setTaskModalVisible(true);
        // Activamos directamente el modo de edición de estado
        setTimeout(() => {
          setEditingTaskStatus(task.status);
        }, 100);
      }
    };
    
    return (
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {completed ? 
              <CheckCircleFilled style={{ color: 'green', marginRight: 8 }} /> : 
              <CheckCircleOutlined style={{ marginRight: 8 }} />
            }
            <span>{task.name_task}</span>
          </div>
        }
        style={{ 
          marginBottom: 16,
          borderLeft: completed ? '5px solid #52c41a' : isPastDue ? '5px solid #f5222d' : '5px solid #1890ff',
          height: '100%'
        }}
        actions={
          isPersonal ? [
            <Button 
  type="default"
  onClick={() => {
    setSelectedTask(task);
    setTaskModalVisible(true);
    // Dar tiempo para que el modal se abra y se actualice selectedTask
    setTimeout(() => {
      try {
        if (task.status) {
          console.log("Activando edición para status:", task.status);
          setEditingTaskStatus(task.status);
        }
      } catch (error) {
        console.error("Error al activar edición de estado:", error);
      }
    }, 300);
  }}
  size="small"
>
  Cambiar Estado
</Button>,
            <Popconfirm
              title="¿Estás seguro de eliminar esta tarea?"
              onConfirm={() => handleDeletePersonalTask(task._id)}
              okText="Sí"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger size="small">Eliminar</Button>
            </Popconfirm>
          ] : [
            <Button 
              type="primary" 
              onClick={() => {
                setSelectedTask(task);
                setTaskModalVisible(true);
              }}
              size="small"
            >
              Ver Detalles
            </Button>,
            <Button 
              type="default"
              onClick={handleStatusChange}
              size="small"
            >
              Cambiar Estado
            </Button>
          ]
        }
      >
        <Paragraph ellipsis={{ rows: 2 }}>{task.description}</Paragraph>
        <div style={{ marginTop: 12 }}>
          <Tag color={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Tag>
          <Tag color={isPastDue ? 'red' : 'blue'} icon={<ClockCircleOutlined />}>
            {deadlineDate.toLocaleString()}
          </Tag>
        </div>
      </Card>
    );
  };

  const GroupTasks = ({ groupId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('status'); // 'category' o 'status' por defecto status
    const [activeTabKey, setActiveTabKey] = useState('in_progress');

    const fetchTasks = async () => {
      setLoading(true);
      try {
        console.log("Obteniendo tareas del grupo:", groupId);
        const response = await axios.get(`${API_URL}/groups/${groupId}/tasks`, { headers });
        console.log("Tareas del grupo recibidas:", response.data);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        message.error('Error al obtener las tareas');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (groupId) {
        fetchTasks();
      }
    }, [groupId]);

    // Agregar efecto para refrescar tareas cuando se cierre el modal
    useEffect(() => {
      if (!taskModalVisible && groupId) {
        fetchTasks();
      }
    }, [taskModalVisible, groupId]);

    // Filtrar tareas completadas y pendientes
    const pendingTasks = tasks.filter(task => !isTaskCompletedByMe(task));
    const completedTasks = tasks.filter(task => isTaskCompletedByMe(task));
    
    // Agrupar tareas por categoría o estado
    const pendingByCategory = groupTasksByCategory(pendingTasks);
    const pendingByStatus = groupTasksByStatus(pendingTasks);
    const completedByCategory = groupTasksByCategory(completedTasks);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Radio.Group 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
            optionType="button"
            options={[
              { label: 'Por Categoría', value: 'category' },
              { label: 'Por Estado', value: 'status' }
            ]}
          />
        </div>

        {/* Modificar la parte de los Tabs para mostrar una pestaña por cada estado */}
        <Tabs 
          activeKey={activeTabKey}
          onChange={setActiveTabKey} 
          defaultActiveKey="in_progress"
        >
          {/* Pestaña para tareas En Progreso */}
          <TabPane 
            tab={
              <span>
                En Progreso <Badge count={pendingByStatus['In Progress'].length} style={{ backgroundColor: '#1890ff' }} />
              </span>
            } 
            key="in_progress"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingByStatus['In Progress'].length === 0 ? (
              <Empty 
                description="No hay tareas en progreso" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : viewMode === 'category' ? (
              // Vista por categoría
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => {
                // Filtrar solo tareas en progreso
                const tasksInProgress = categoryTasks.filter(task => task.status === 'In Progress');
                if (tasksInProgress.length === 0) return null;
                
                return (
                  <div key={category} style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color="cyan" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {tasksInProgress.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })
            ) : (
              <Row gutter={[16, 16]}>
                {pendingByStatus['In Progress'].map(task => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                    <TaskCard task={task} />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>

          {/* Pestaña para tareas En Revisión */}
          <TabPane 
            tab={
              <span>
                En Revisión <Badge count={pendingByStatus['Revision'].length} style={{ backgroundColor: '#f50' }} />
              </span>
            } 
            key="revision"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingByStatus['Revision'].length === 0 ? (
              <Empty 
                description="No hay tareas en revisión" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : viewMode === 'category' ? (
              // Vista por categoría
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => {
                // Filtrar solo tareas en revisión
                const tasksInRevision = categoryTasks.filter(task => task.status === 'Revision');
                if (tasksInRevision.length === 0) return null;
                
                return (
                  <div key={category} style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color="cyan" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {tasksInRevision.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })
            ) : (
              <Row gutter={[16, 16]}>
                {pendingByStatus['Revision'].map(task => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                    <TaskCard task={task} />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>

          {/* Pestaña para tareas Pausadas */}
          <TabPane 
            tab={
              <span>
                Pausadas <Badge count={pendingByStatus['Paused'].length} style={{ backgroundColor: '#fa8c16' }} />
              </span>
            } 
            key="paused"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingByStatus['Paused'].length === 0 ? (
              <Empty 
                description="No hay tareas pausadas" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : viewMode === 'category' ? (
              // Vista por categoría
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => {
                // Filtrar solo tareas pausadas
                const tasksPaused = categoryTasks.filter(task => task.status === 'Paused');
                if (tasksPaused.length === 0) return null;
                
                return (
                  <div key={category} style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color="cyan" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {tasksPaused.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })
            ) : (
              <Row gutter={[16, 16]}>
                {pendingByStatus['Paused'].map(task => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                    <TaskCard task={task} />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>

          {/* Pestaña para tareas Completadas/Hechas */}
          <TabPane 
            tab={
              <span>
                Completadas <Badge count={pendingByStatus['Done'].length + completedTasks.length} style={{ backgroundColor: '#52c41a' }} />
              </span>
            } 
            key="completed"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : (pendingByStatus['Done'].length === 0 && completedTasks.length === 0) ? (
              <Empty 
                description="No hay tareas completadas" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              <div>
                {pendingByStatus['Done'].length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color={getStatusColor('Done')} style={{ fontSize: '16px', padding: '5px 10px' }}>
                        {getStatusLabel('Done')}
                      </Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {pendingByStatus['Done'].map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
                {completedTasks.length > 0 && (
                  <div>
                    <Divider orientation="left">
                      <Tag color="green" style={{ fontSize: '16px', padding: '5px 10px' }}>
                        Marcadas como Completadas
                      </Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {completedTasks.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  const PersonalTasksList = () => {
    const [viewMode, setViewMode] = useState('status'); // 'category' o 'status' por defecto status
    const [activeTabKey, setActiveTabKey] = useState('in_progress');
    
    // Filtrar tareas completadas y pendientes
    const pendingTasks = personalTasks.filter(task => !task.completed);
    const completedTasks = personalTasks.filter(task => task.completed);
    
    // Agrupar tareas por categoría o estado
    const pendingByCategory = groupTasksByCategory(pendingTasks);
    const pendingByStatus = groupTasksByStatus(pendingTasks);
    const completedByCategory = groupTasksByCategory(completedTasks);

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Radio.Group 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
            optionType="button"
            options={[
              { label: 'Por Categoría', value: 'category' },
              { label: 'Por Estado', value: 'status' }
            ]}
          />
        </div>

        {/* Tabs para tareas personales, organizadas por estado */}
        <Tabs 
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          defaultActiveKey="in_progress"
        >
          {/* Pestaña para tareas En Progreso */}
          <TabPane 
            tab={
              <span>
                En Progreso <Badge count={pendingByStatus['In Progress'].length} style={{ backgroundColor: '#1890ff' }} />
              </span>
            } 
            key="in_progress"
          >
            {personalTasksLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingByStatus['In Progress'].length === 0 ? (
              <Empty 
                description="No hay tareas en progreso" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : viewMode === 'category' ? (
              // Vista por categoría
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => {
                // Filtrar solo tareas en progreso
                const tasksInProgress = categoryTasks.filter(task => task.status === 'In Progress');
                if (tasksInProgress.length === 0) return null;
                
                return (
                  <div key={category} style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color="purple" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {tasksInProgress.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} isPersonal={true} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })
            ) : (
              <Row gutter={[16, 16]}>
                {pendingByStatus['In Progress'].map(task => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                    <TaskCard task={task} isPersonal={true} />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>

          {/* Pestaña para tareas En Revisión */}
          <TabPane 
            tab={
              <span>
                En Revisión <Badge count={pendingByStatus['Revision'].length} style={{ backgroundColor: '#f50' }} />
              </span>
            } 
            key="revision"
          >
            {personalTasksLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingByStatus['Revision'].length === 0 ? (
              <Empty 
                description="No hay tareas en revisión" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : viewMode === 'category' ? (
              // Vista por categoría
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => {
                // Filtrar solo tareas en revisión
                const tasksInRevision = categoryTasks.filter(task => task.status === 'Revision');
                if (tasksInRevision.length === 0) return null;
                
                return (
                  <div key={category} style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color="purple" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {tasksInRevision.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} isPersonal={true} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })
            ) : (
              <Row gutter={[16, 16]}>
                {pendingByStatus['Revision'].map(task => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                    <TaskCard task={task} isPersonal={true} />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>

          {/* Pestaña para tareas Pausadas */}
          <TabPane 
            tab={
              <span>
                Pausadas <Badge count={pendingByStatus['Paused'].length} style={{ backgroundColor: '#fa8c16' }} />
              </span>
            } 
            key="paused"
          >
            {personalTasksLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingByStatus['Paused'].length === 0 ? (
              <Empty 
                description="No hay tareas pausadas" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : viewMode === 'category' ? (
              // Vista por categoría
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => {
                // Filtrar solo tareas pausadas
                const tasksPaused = categoryTasks.filter(task => task.status === 'Paused');
                if (tasksPaused.length === 0) return null;
                
                return (
                  <div key={category} style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color="purple" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {tasksPaused.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} isPersonal={true} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })
            ) : (
              <Row gutter={[16, 16]}>
                {pendingByStatus['Paused'].map(task => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                    <TaskCard task={task} isPersonal={true} />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>

          {/* Pestaña para tareas Completadas/Hechas */}
          <TabPane 
            tab={
              <span>
                Completadas <Badge count={pendingByStatus['Done'].length + completedTasks.length} style={{ backgroundColor: '#52c41a' }} />
              </span>
            } 
            key="completed"
          >
            {personalTasksLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : (pendingByStatus['Done'].length === 0 && completedTasks.length === 0) ? (
              <Empty 
                description="No hay tareas completadas" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              <div>
                {pendingByStatus['Done'].length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <Divider orientation="left">
                      <Tag color={getStatusColor('Done')} style={{ fontSize: '16px', padding: '5px 10px' }}>
                        {getStatusLabel('Done')}
                      </Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {pendingByStatus['Done'].map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} isPersonal={true} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
                {completedTasks.length > 0 && (
                  <div>
                    <Divider orientation="left">
                      <Tag color="green" style={{ fontSize: '16px', padding: '5px 10px' }}>
                        Marcadas como Completadas
                      </Tag>
                    </Divider>
                    <Row gutter={[16, 16]}>
                      {completedTasks.map(task => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                          <TaskCard task={task} isPersonal={true} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Dashboard de Estudiante</Title>
        <Button onClick={showLogoutConfirm} icon={<LogoutOutlined />}>
          Cerrar Sesión
        </Button>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              Grupos y Tareas Asignadas
            </span>
          } 
          key="groups">
          {groups.length === 0 ? (
            <Card>
              <Empty 
                description="No estás asignado a ningún grupo todavía" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            </Card>
          ) : (
            <Tabs 
              activeKey={selectedGroup} 
              onChange={setSelectedGroup}
              type="card"
            >
              {groups.map(group => (
                <TabPane 
                  tab={group.name} 
                  key={group._id}
                >
                  <Card style={{ marginBottom: 16 }}>
                    <Title level={4}>{group.name}</Title>
                    <Paragraph>{group.description}</Paragraph>
                    <Text type="secondary">
                      Creado por: {group.created_by ? group.created_by.full_name : 'Administrador'}
                    </Text>
                  </Card>
                  
                  <GroupTasks groupId={group._id} />
                </TabPane>
              ))}
            </Tabs>
          )}
        </TabPane>
        <TabPane 
          tab={
            <span>
              Mis Tareas Personales
            </span>
          } 
          key="personal"
        >
          <PersonalTasksList />
        </TabPane>
      </Tabs>

      {/* Modal para ver detalles de tarea de grupo y cambiar estado */}
      <Modal
        title="Detalles de la Tarea"
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          setEditingTaskStatus(null);
        }}
        footer={[
          <Button key="back" onClick={() => setTaskModalVisible(false)}>
            Cerrar
          </Button>,
          <Button 
            key="changeStatus" 
            type="primary"
            onClick={() => setEditingTaskStatus(selectedTask?.status || 'In Progress')}
          >
            Cambiar Estado
          </Button>
        ]}
        wrapClassName={theme === 'dark' ? 'dark-theme' : ''}
      >
        {selectedTask && (
          <div>
            <Title level={4}>{selectedTask.name_task}</Title>
            <Paragraph>{selectedTask.description}</Paragraph>
            
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Información de la Tarea" key="1">
               {/* En el modal de detalles de tarea, reemplaza la sección del estado con este código */}
<p>
  <strong>Estado:</strong> 
  {editingTaskStatus !== null ? (
    <div style={{ marginTop: 8 }}>
      <Select 
        defaultValue={selectedTask.status}
        value={editingTaskStatus}
        onChange={(value) => {
          console.log("Cambiando estado de:", selectedTask.status, "a:", value);
          setEditingTaskStatus(value);
        }}
        style={{ width: 200 }}
      >
        {taskStatuses.map(status => (
          <Option key={status.value} value={status.value}>
            {status.label}
          </Option>
        ))}
      </Select>
      <Button 
        type="primary"
        size="small" 
        style={{ marginLeft: 8 }}
        onClick={() => {
          if (editingTaskStatus && editingTaskStatus !== selectedTask.status) {
            handleUpdateTaskStatus(selectedTask._id, editingTaskStatus);
          } else {
            setEditingTaskStatus(null);
          }
        }}
      >
        Aplicar
      </Button>
      <Button 
        size="small" 
        style={{ marginLeft: 8 }}
        onClick={() => setEditingTaskStatus(null)}
      >
        Cancelar
      </Button>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Tag color={getStatusColor(selectedTask.status)}>
        {getStatusLabel(selectedTask.status)}
      </Tag>
      <Button 
        type="link" 
        size="small" 
        onClick={() => setEditingTaskStatus(selectedTask.status)}
        style={{ marginLeft: 8 }}
      >
        Cambiar
      </Button>
    </div>
  )}
</p>
                <p><strong>Fecha Límite:</strong> {new Date(selectedTask.dead_line).toLocaleString()}</p>
                {selectedTask.category && (
                  <p><strong>Categoría:</strong> {selectedTask.category}</p>
                )}
              </Panel>
            </Collapse>
          </div>
        )}
      </Modal>

      {/* Modal para crear/editar tarea personal */}
      <Modal
        title={editingPersonalTask ? "Editar Tarea Personal" : "Crear Tarea Personal"}
        open={personalTaskModalVisible}
        onCancel={() => {
          setPersonalTaskModalVisible(false);
          setEditingPersonalTask(null);
          taskForm.resetFields();
        }}
        footer={null}
        wrapClassName={theme === 'dark' ? 'dark-theme' : ''}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleSavePersonalTask}
        >
          <Form.Item
            name="name_task"
            label="Nombre de la Tarea"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de la tarea' }]}
          >
            <Input placeholder="Nombre de la tarea" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
          >
            <TextArea rows={4} placeholder="Descripción de la tarea" />
          </Form.Item>
          
          <Form.Item
            name="dead_line"
            label="Fecha de Vencimiento"
            rules={[{ required: true, message: 'Por favor selecciona una fecha de vencimiento' }]}
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm" 
              placeholder="Selecciona fecha y hora"
              style={{ width: '100%' }}
              dropdownClassName={theme === 'dark' ? 'dark-theme' : ''}
            />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
          >
            <Select 
              placeholder="Selecciona un estado"
              dropdownClassName={theme === 'dark' ? 'dark-theme' : ''}
            >
              {taskStatuses.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Categoría"
          >
            <Input placeholder="Categoría de la tarea (opcional)" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPersonalTask ? "Actualizar" : "Crear"}
              </Button>
              <Button 
                onClick={() => {
                  setPersonalTaskModalVisible(false);
                  setEditingPersonalTask(null);
                  taskForm.resetFields();
                }}
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de confirmación para cerrar sesión */}
      <Modal
        title="Cerrar Sesión"
        open={logoutModalVisible}
        onOk={handleDestroyToken}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Sí, cerrar sesión"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas cerrar la sesión?</p>
      </Modal>
      
      {/* Botón flotante (solo visible en la pestaña de tareas personales) */}
      {activeTab === 'personal' && (
        <FloatButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreatePersonalTaskModal}
          tooltip="Nueva tarea personal"
          style={{ backgroundColor: '#6a11cb', borderColor: '#6a11cb' }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;