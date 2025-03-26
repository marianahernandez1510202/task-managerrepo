// StudentDashboard.jsx - Componente actualizado con tareas por sección y columnas
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import axios from 'axios';
import { 
  Card, List, Button, Tag, message, Modal, Tabs, Typography, Collapse, Badge, 
  Form, Input, DatePicker, Select, Space, Popconfirm, Empty, Row, Col, Divider
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

  // Toggle task completion status (for group tasks)
  const handleToggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/complete`, {}, { headers });
      message.success(isCompleted ? 'Tarea marcada como pendiente' : 'Tarea marcada como completada');
      setTaskModalVisible(false);
      
      // Refresh the tasks
      fetchGroups();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      message.error('Error al cambiar el estado de la tarea');
    }
  };

  // Toggle personal task completion
  const handleTogglePersonalTaskCompletion = async (taskId, isCompleted) => {
    try {
      await axios.post(`${API_URL}/personal-tasks/${taskId}/toggle-complete`, {}, { headers });
      message.success(isCompleted ? 'Tarea marcada como pendiente' : 'Tarea marcada como completada');
      fetchPersonalTasks();
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
  
      // Redirigir al usuario a la página de login sin recargar la página
      navigate("/login");
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

  const TaskCard = ({ task, isPersonal = false }) => {
    // For personal tasks, use the 'completed' field
    // For group tasks, check if completed by current user
    const completed = isPersonal ? task.completed : isTaskCompletedByMe(task);
    const deadlineDate = new Date(task.dead_line);
    const isPastDue = deadlineDate < new Date();
    
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
              icon={<EditOutlined />}
              onClick={() => showEditPersonalTaskModal(task)}
              size="small"
            >
              Editar
            </Button>,
            <Button 
              type={completed ? 'default' : 'primary'}
              onClick={() => handleTogglePersonalTaskCompletion(task._id, completed)}
              size="small"
            >
              {completed ? 'Marcar Pendiente' : 'Completar'}
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
            </Button>
          ]
        }
      >
        <Paragraph ellipsis={{ rows: 2 }}>{task.description}</Paragraph>
        <div style={{ marginTop: 12 }}>
          <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
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

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/groups/${groupId}/tasks`, { headers });
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

    // Separate tasks into pending and completed
    const pendingTasks = tasks.filter(task => !isTaskCompletedByMe(task));
    const completedTasks = tasks.filter(task => isTaskCompletedByMe(task));
    
    // Agrupar tareas pendientes por categoría
    const pendingByCategory = groupTasksByCategory(pendingTasks);
    const completedByCategory = groupTasksByCategory(completedTasks);

    return (
      <div>
        <Tabs defaultActiveKey="pending">
          <TabPane 
            tab={
              <span>
                Pendientes <Badge count={pendingTasks.length} style={{ backgroundColor: '#1890ff' }} />
              </span>
            } 
            key="pending"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingTasks.length === 0 ? (
              <Empty 
                description="No hay tareas pendientes" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => (
                <div key={category} style={{ marginBottom: 20 }}>
                  <Divider orientation="left">
                    <Tag color="cyan" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                  </Divider>
                  <Row gutter={[16, 16]}>
                    {categoryTasks.map(task => (
                      <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                        <TaskCard task={task} />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))
            )}
          </TabPane>
          <TabPane 
            tab={
              <span>
                Completadas <Badge count={completedTasks.length} style={{ backgroundColor: '#52c41a' }} />
              </span>
            } 
            key="completed"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : completedTasks.length === 0 ? (
              <Empty 
                description="No hay tareas completadas" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              Object.entries(completedByCategory).map(([category, categoryTasks]) => (
                <div key={category} style={{ marginBottom: 20 }}>
                  <Divider orientation="left">
                    <Tag color="cyan" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                  </Divider>
                  <Row gutter={[16, 16]}>
                    {categoryTasks.map(task => (
                      <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                        <TaskCard task={task} />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  const PersonalTasksList = () => {
    // Separate tasks into pending and completed
    const pendingTasks = personalTasks.filter(task => !task.completed);
    const completedTasks = personalTasks.filter(task => task.completed);
    
    // Agrupar tareas por categoría
    const pendingByCategory = groupTasksByCategory(pendingTasks);
    const completedByCategory = groupTasksByCategory(completedTasks);

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreatePersonalTaskModal}
          >
            Crear Nueva Tarea
          </Button>
        </div>

        <Tabs defaultActiveKey="pending">
          <TabPane 
            tab={
              <span>
                Pendientes <Badge count={pendingTasks.length} style={{ backgroundColor: '#1890ff' }} />
              </span>
            } 
            key="pending"
          >
            {personalTasksLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : pendingTasks.length === 0 ? (
              <Empty 
                description="No tienes tareas pendientes" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              Object.entries(pendingByCategory).map(([category, categoryTasks]) => (
                <div key={category} style={{ marginBottom: 20 }}>
                  <Divider orientation="left">
                    <Tag color="purple" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                  </Divider>
                  <Row gutter={[16, 16]}>
                    {categoryTasks.map(task => (
                      <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                        <TaskCard task={task} isPersonal={true} />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))
            )}
          </TabPane>
          <TabPane 
            tab={
              <span>
                Completadas <Badge count={completedTasks.length} style={{ backgroundColor: '#52c41a' }} />
              </span>
            } 
            key="completed"
          >
            {personalTasksLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tareas...</div>
            ) : completedTasks.length === 0 ? (
              <Empty 
                description="No tienes tareas completadas" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              Object.entries(completedByCategory).map(([category, categoryTasks]) => (
                <div key={category} style={{ marginBottom: 20 }}>
                  <Divider orientation="left">
                    <Tag color="purple" style={{ fontSize: '16px', padding: '5px 10px' }}>{category}</Tag>
                  </Divider>
                  <Row gutter={[16, 16]}>
                    {categoryTasks.map(task => (
                      <Col xs={24} sm={12} md={8} lg={8} xl={6} key={task._id}>
                        <TaskCard task={task} isPersonal={true} />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Dashboard de Estudiante</Title>
        <Button 
          type="danger" 
          icon={<LogoutOutlined />} 
          onClick={showLogoutConfirm}
        >
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
          key="groups"
        >
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

      {/* Modal para ver detalles de tarea de grupo y marcarla como completada */}
      <Modal
        title="Detalles de la Tarea"
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setTaskModalVisible(false)}>
            Cerrar
          </Button>,
          <Button 
            key="complete" 
            type={selectedTask && isTaskCompletedByMe(selectedTask) ? 'default' : 'primary'}
            onClick={() => handleToggleTaskCompletion(
              selectedTask?._id, 
              selectedTask && isTaskCompletedByMe(selectedTask)
            )}
          >
            {selectedTask && isTaskCompletedByMe(selectedTask) 
              ? 'Marcar como Pendiente' 
              : 'Marcar como Completada'
            }
          </Button>,
        ]}
      >
        {selectedTask && (
          <div>
            <Title level={4}>{selectedTask.name_task}</Title>
            <Paragraph>{selectedTask.description}</Paragraph>
            
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Información de la Tarea" key="1">
                <p><strong>Estado:</strong> <Tag color={getStatusColor(selectedTask.status)}>{selectedTask.status}</Tag></p>
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
            />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
          >
            <Select placeholder="Selecciona un estado">
              <Option value="In Progress">En Progreso</Option>
              <Option value="Paused">Pausada</Option>
              <Option value="Revision">En Revisión</Option>
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
        onCancel={() => setLogoutModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setLogoutModalVisible(false)}>
            Cancelar
          </Button>,
          <Button 
            key="submit" 
            type="danger" 
            onClick={handleDestroyToken}
          >
            Confirmar Cierre de Sesión
          </Button>,
        ]}
      >
        <p>¿Estás seguro que deseas cerrar la sesión? Se destruirán los tokens de autenticación.</p>
      </Modal>
    </div>
  );
};

export default StudentDashboard;