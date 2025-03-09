// TaskList.jsx - Componente para listar y gestionar tareas
import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, Space, Tag, message, Form } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import groupService from '../../../services/groupService';
import taskService from '../../../services/taskService';
import EditTaskModal from './Modals/EditTaskModal';

const TaskList = ({ groupId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [form] = Form.useForm();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await groupService.getGroupTasks(groupId);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Error al obtener las tareas: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchTasks();
    }
  }, [groupId]);

  const handleUpdateTask = async (values) => {
    setFormLoading(true);
    try {
      await taskService.updateTask(selectedTask._id, values);
      message.success('Tarea actualizada exitosamente');
      setEditModalVisible(false);
      form.resetFields();
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      message.error('Error al actualizar la tarea: ' + (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      message.success('Tarea eliminada exitosamente');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      message.error('Error al eliminar la tarea: ' + (error.response?.data?.message || error.message));
    }
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

  // Función para formatear la fecha ISO a un formato legible
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      // Crear un objeto Date a partir de la cadena ISO
      const date = new Date(isoString);
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return isoString; // Devolver la cadena original si no es una fecha válida
      }
      
      // Formatear la fecha para mostrarla
      return date.toLocaleString();
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return isoString;
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name_task',
      key: 'name_task',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Fecha Límite',
      dataIndex: 'dead_line',
      key: 'dead_line',
      render: text => formatDateTime(text),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: text => <Tag color={getStatusColor(text)}>{text}</Tag>,
    },
    {
      title: 'Completada por',
      key: 'completed',
      render: (_, record) => `${record.completed_by ? record.completed_by.length : 0} estudiantes`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTask(record);
              
              // Formatear la fecha para el input datetime-local
              let deadLineFormatted = '';
              if (record.dead_line) {
                const date = new Date(record.dead_line);
                if (!isNaN(date.getTime())) {
                  // Formato YYYY-MM-DDThh:mm
                  deadLineFormatted = date.toISOString().slice(0, 16);
                }
              }
              
              form.setFieldsValue({
                name_task: record.name_task,
                description: record.description,
                dead_line: deadLineFormatted,
                status: record.status,
                category: record.category || '',
              });
              
              setEditModalVisible(true);
            }}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar esta tarea?"
            onConfirm={() => handleDeleteTask(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table 
        columns={columns} 
        dataSource={tasks} 
        rowKey="_id"
        loading={loading}
      />

      <EditTaskModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
          setSelectedTask(null);
        }}
        onFinish={handleUpdateTask}
        form={form}
        loading={formLoading}
      />
    </div>
  );
};

export default TaskList;