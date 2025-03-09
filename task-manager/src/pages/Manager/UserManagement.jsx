// pages/Manager/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Modal, Form, Input, Popconfirm, 
  message, Space, Typography, Select, DatePicker, Tag
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  UserOutlined, KeyOutlined, ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/es';

// Importamos los servicios
import userService from '../../services/userService';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = ({ updateUserData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordForm] = Form.useForm();

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Error al obtener los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create a new user
  const handleCreateUser = async (values) => {
    try {
      // Convertir el objeto moment a string para la fecha
      const userData = {
        ...values,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD')
      };
      
      await userService.createUser(userData);
      message.success('Usuario creado exitosamente');
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      message.error('Error al crear el usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update existing user
  const handleUpdateUser = async (values) => {
    try {
      // Convertir el objeto moment a string para la fecha
      const userData = {
        ...values,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD')
      };
      
      const response = await userService.updateUser(selectedUser._id, userData);
      message.success('Usuario actualizado exitosamente');
      
      // Si el usuario actualizado es el usuario actual, actualizar también en el estado de la app
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && currentUser.id === selectedUser._id) {
        const updatedUser = {
          ...currentUser,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role
        };
        
        if (updateUserData) {
          updateUserData(updatedUser);
        }
      }
      
      setModalVisible(false);
      form.resetFields();
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Error al actualizar el usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      // Verificar que no está eliminando su propio usuario
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && currentUser.id === userId) {
        message.error('No puedes eliminarte a ti mismo');
        return;
      }
      
      await userService.deleteUser(userId);
      message.success('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Error al eliminar el usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  // Change password
  const handleChangePassword = async (values) => {
    try {
      await userService.changePassword(selectedUser._id, values.password);
      message.success('Contraseña actualizada exitosamente');
      setChangePasswordModal(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Error al cambiar la contraseña: ' + (error.response?.data?.message || error.message));
    }
  };

  // Columns for the user table
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Fecha de Nacimiento',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      render: (text) => text ? moment(text).format('DD/MM/YYYY') : '-',
      sorter: (a, b) => moment(a.date_of_birth).unix() - moment(b.date_of_birth).unix()
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (text) => 
        <Tag color={text === 'superadmin' ? 'blue' : 'green'}>
          {text === 'superadmin' ? 'Administrador' : 'Estudiante'}
        </Tag>,
      filters: [
        { text: 'Administrador', value: 'superadmin' },
        { text: 'Estudiante', value: 'student' },
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Último Login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (text) => text ? moment(text).format('DD/MM/YYYY HH:mm') : '-',
      sorter: (a, b) => moment(a.last_login || 0).unix() - moment(b.last_login || 0).unix()
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => {
        // Verificar si es el usuario actual
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const isSelf = currentUser && currentUser.id === record._id;
        
        return (
          <Space size="middle">
            <Button 
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUser(record);
                form.setFieldsValue({
                  full_name: record.full_name,
                  email: record.email,
                  date_of_birth: record.date_of_birth ? moment(record.date_of_birth) : null,
                  role: record.role
                });
                setModalVisible(true);
              }}
            >
              Editar
            </Button>
            <Button 
              icon={<KeyOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setChangePasswordModal(true);
              }}
            >
              Cambiar Contraseña
            </Button>
            <Popconfirm
              title={isSelf 
                ? "No puedes eliminarte a ti mismo" 
                : "¿Estás seguro de eliminar este usuario?"
              }
              onConfirm={() => !isSelf && handleDeleteUser(record._id)}
              okText="Sí"
              cancelText="No"
              disabled={isSelf}
            >
              <Button icon={<DeleteOutlined />} danger disabled={isSelf}>
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Gestión de Usuarios</Title>
        <div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setSelectedUser(null);
              form.resetFields();
              setModalVisible(true);
            }}
            style={{ marginRight: 8 }}
          >
            Crear Usuario
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchUsers}
          >
            Actualizar
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="_id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} usuarios`
        }}
      />

      {/* Modal para crear/editar usuario */}
      <Modal
        title={selectedUser ? "Editar Usuario" : "Crear Usuario"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedUser(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedUser ? handleUpdateUser : handleCreateUser}
          initialValues={selectedUser ? {
            ...selectedUser,
            date_of_birth: selectedUser.date_of_birth ? moment(selectedUser.date_of_birth) : null
          } : {}}
        >
          <Form.Item
            name="full_name"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingresa el nombre completo' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nombre completo" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingresa el email' },
              { type: 'email', message: 'Por favor ingresa un email válido' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          
          <Form.Item
            name="date_of_birth"
            label="Fecha de Nacimiento"
            rules={[{ required: true, message: 'Por favor selecciona la fecha de nacimiento' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY" 
              placeholder="Selecciona fecha"
            />
          </Form.Item>
          
          {!selectedUser && (
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Por favor ingresa la contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
              ]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder="Contraseña" />
            </Form.Item>
          )}
          
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
          >
            <Select placeholder="Selecciona un rol">
              <Option value="student">Estudiante</Option>
              <Option value="superadmin">Administrador</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedUser ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
            <Button 
              onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setSelectedUser(null);
              }} 
              style={{ marginLeft: 8 }}
            >
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal
        title="Cambiar Contraseña"
        open={changePasswordModal}
        onCancel={() => {
          setChangePasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="password"
            label="Nueva Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa la nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password prefix={<KeyOutlined />} placeholder="Nueva contraseña" />
          </Form.Item>
          
          <Form.Item
            name="confirm"
            label="Confirmar Contraseña"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<KeyOutlined />} placeholder="Confirmar contraseña" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cambiar Contraseña
            </Button>
            <Button 
              onClick={() => {
                setChangePasswordModal(false);
                passwordForm.resetFields();
              }} 
              style={{ marginLeft: 8 }}
            >
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;