// GroupManager.jsx - Componente refactorizado para gestionar grupos
import React, { useState, useEffect } from 'react';
import { 
  Button, Table, Form, Popconfirm, 
  message, Tabs, Space, Typography 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  UserAddOutlined, FileAddOutlined, UserDeleteOutlined 
} from '@ant-design/icons';

// Importamos los servicios
import groupService from '../../services/groupService';
import userService from '../../services/userService';
import authService from '../../services/authService';

// Importamos los componentes de modales
import GroupModal from './Task/Modals/GroupModal';
import StudentModal from './Task/Modals/StudentModal';
import TaskModal from './Task/Modals/TaskModal';
import TaskList from './Task/TaskList';

const { Title } = Typography;
const { TabPane } = Tabs;

const GroupManager = () => {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupForm] = Form.useForm();
  const [studentForm] = Form.useForm();
  const [taskForm] = Form.useForm();

  // Fetch groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await groupService.getAllGroups();
      console.log('Grupos recibidos:', data);
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      message.error('Error al obtener los grupos');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students for assignment
  const fetchStudents = async () => {
    try {
      const data = await userService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Error al obtener la lista de estudiantes');
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  // Create a new group
  const handleCreateGroup = async (values) => {
    setFormLoading(true);
    try {
      await groupService.createGroup(values);
      message.success('Grupo creado exitosamente');
      setGroupModalVisible(false);
      groupForm.resetFields();
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      message.error('Error al crear el grupo: ' + (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  // Update existing group
  const handleUpdateGroup = async (values) => {
    setFormLoading(true);
    try {
      if (!selectedGroup || !selectedGroup._id) {
        throw new Error('No hay un grupo seleccionado para actualizar');
      }
      
      await groupService.updateGroup(selectedGroup._id, values);
      message.success('Grupo actualizado exitosamente');
      setGroupModalVisible(false);
      groupForm.resetFields();
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      message.error('Error al actualizar el grupo: ' + (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  // Delete group
  const handleDeleteGroup = async (groupId) => {
    try {
      await groupService.deleteGroup(groupId);
      message.success('Grupo eliminado exitosamente');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      message.error('Error al eliminar el grupo: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add students to group
  const handleAddStudents = async (values) => {
    setFormLoading(true);
    try {
      console.log('Enviando estudiantes:', values.students);
      const data = await groupService.addStudentsToGroup(selectedGroup._id, values.students);
      console.log('Respuesta del servidor:', data);
      
      // Actualizar solo el grupo modificado en el estado
      if (data.group) {
        setGroups(prevGroups => prevGroups.map(g => 
          g._id === data.group._id ? data.group : g
        ));
      } else {
        // Si no recibimos el grupo actualizado, hacemos fetchGroups completo
        fetchGroups();
      }
      
      message.success('Estudiantes agregados exitosamente');
      setStudentModalVisible(false);
      studentForm.resetFields();
    } catch (error) {
      console.error('Error adding students:', error.response?.data || error);
      message.error('Error al agregar estudiantes: ' + (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  // Remove a student from group
  const handleRemoveStudent = async (groupId, studentId) => {
    try {
      await groupService.removeStudentFromGroup(groupId, studentId);
      message.success('Estudiante eliminado del grupo');
      fetchGroups();
    } catch (error) {
      console.error('Error removing student:', error);
      message.error('Error al eliminar el estudiante del grupo: ' + (error.response?.data?.message || error.message));
    }
  };

  // Create a task in a group
  const handleCreateTask = async (values) => {
    setFormLoading(true);
    try {
      await groupService.createTaskInGroup(selectedGroup._id, values);
      message.success('Tarea creada exitosamente');
      setTaskModalVisible(false);
      taskForm.resetFields();
      fetchGroups();
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Error al crear la tarea: ' + (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  // Función para manejar el cierre de modal y limpiar el estado
  const handleCloseGroupModal = () => {
    setGroupModalVisible(false);
    groupForm.resetFields();
    setSelectedGroup(null);
  };

  // Group list columns
  const groupColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Estudiantes',
      key: 'students',
      render: (_, record) => (
        <span>{record.students ? record.students.length : 0} estudiantes</span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<UserAddOutlined />} 
            onClick={() => {
              setSelectedGroup(record);
              setStudentModalVisible(true);
            }}
          >
            Agregar Estudiantes
          </Button>
          <Button 
            icon={<FileAddOutlined />}
            onClick={() => {
              setSelectedGroup(record);
              setTaskModalVisible(true);
            }}
          >
            Agregar Tarea
          </Button>
          <Button 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedGroup(record);
              setGroupModalVisible(true);
            }}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este grupo?"
            onConfirm={() => handleDeleteGroup(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Student list columns
  const studentColumns = [
    {
      title: 'Nombre',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="¿Estás seguro de eliminar este estudiante del grupo?"
          onConfirm={() => handleRemoveStudent(selectedGroup._id, record._id)}
          okText="Sí"
          cancelText="No"
        >
          <Button icon={<UserDeleteOutlined />} danger>Eliminar</Button>
        </Popconfirm>
      ),
    },
  ];

  // Función para cerrar sesión
  const handleLogout = () => {
    authService.logout();
    message.success('Sesión cerrada exitosamente');
    // Opcional: redirigir al login
    window.location.href = '/login';
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Gestión de Grupos</Title>
        <div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setSelectedGroup(null);
              groupForm.resetFields();
              setGroupModalVisible(true);
            }}
            style={{ marginRight: 8 }}
          >
            Crear Grupo
          </Button>
          
        </div>
      </div>

      <Table 
        columns={groupColumns} 
        dataSource={groups} 
        rowKey="_id"
        loading={loading}
        expandable={{
          expandedRowRender: record => {
            console.log('Estudiantes en el grupo:', record.students);
            // Establecer el grupo seleccionado para que TaskList pueda eliminar estudiantes
            setSelectedGroup(record);
            return (
              <Tabs defaultActiveKey="1">
                <TabPane tab="Estudiantes" key="1">
                  <Table 
                    columns={studentColumns} 
                    dataSource={Array.isArray(record.students) ? record.students : []} 
                    rowKey="_id"
                    pagination={false}
                  />
                </TabPane>
                <TabPane tab="Tareas" key="2">
                  <TaskList groupId={record._id} />
                </TabPane>
              </Tabs>
            );
          },
        }}
      />

      {/* Importamos los modales como componentes separados */}
      <GroupModal
        visible={groupModalVisible}
        onCancel={handleCloseGroupModal}
        onFinish={selectedGroup ? handleUpdateGroup : handleCreateGroup}
        form={groupForm}
        selectedGroup={selectedGroup}
        loading={formLoading}
      />

      <StudentModal
        visible={studentModalVisible}
        onCancel={() => {
          setStudentModalVisible(false);
          studentForm.resetFields();
        }}
        onFinish={handleAddStudents}
        form={studentForm}
        students={students}
        selectedGroup={selectedGroup}
        loading={formLoading}
      />

      <TaskModal
        visible={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          taskForm.resetFields();
        }}
        onFinish={handleCreateTask}
        form={taskForm}
        loading={formLoading}
      />
    </div>
  );
};

export default GroupManager;