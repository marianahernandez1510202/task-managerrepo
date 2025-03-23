// components/Profile.jsx
import React, { useState } from 'react';
import { 
  Card, Typography, Descriptions, Avatar, Row, Col, Button, 
  Form, Input, message, DatePicker, Tabs, Modal, Empty
} from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile = ({ user }) => {
  const [editing, setEditing] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Inicializar el formulario con los datos del usuario
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        full_name: user.full_name,
        email: user.email,
        date_of_birth: user.date_of_birth ? moment(user.date_of_birth) : null
      });
    }
  }, [user, form]);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { "Authorization": `Bearer ${token}` };
      
      const formattedValues = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null
      };
      
      const response = await axios.put(`http://task-manager-back-pl79.onrender.com/api/users/${user.id}`, formattedValues, { headers });
      
      // Actualizar el usuario en localStorage
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      message.success('Perfil actualizado correctamente');
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      message.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { "Authorization": `Bearer ${token}` };
      
      await axios.post(`http://task-manager-back-pl79.onrender.com/api/users/change-password`, {
        current_password: values.current_password,
        new_password: values.new_password
      }, { headers });
      
      message.success('Contraseña actualizada correctamente');
      setChangePassword(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      message.error('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2} style={{ color: '#6a11cb', marginBottom: 24 }}>Mi Perfil</Title>
      
      <Tabs defaultActiveKey="info">
        <TabPane tab="Información Personal" key="info">
          <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
            {!editing ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      size={80} 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#6a11cb' }}
                    />
                    <div style={{ marginLeft: 20 }}>
                      <Title level={3}>{user.full_name}</Title>
                      <Text type="secondary">{user.role === 'superadmin' ? 'Super Administrador' : 'Estudiante'}</Text>
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => setEditing(true)}
                    style={{ backgroundColor: '#6a11cb', borderColor: '#6a11cb' }}
                  >
                    Editar Perfil
                  </Button>
                </div>
                
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Nombre Completo">{user.full_name}</Descriptions.Item>
                  <Descriptions.Item label="Correo Electrónico">{user.email}</Descriptions.Item>
                  <Descriptions.Item label="Fecha de Nacimiento">
                    {user.date_of_birth ? moment(user.date_of_birth).format('DD/MM/YYYY') : 'No especificada'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rol">
                    {user.role === 'superadmin' ? 'Super Administrador' : 'Estudiante'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fecha de Registro">
                    {moment(user.created_at).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Último Acceso">
                    {moment(user.last_login).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
                
                <div style={{ marginTop: 20 }}>
                  <Button 
                    onClick={() => setChangePassword(true)}
                    style={{ color: '#6a11cb' }}
                  >
                    Cambiar Contraseña
                  </Button>
                </div>
              </>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Form.Item
                  name="full_name"
                  label="Nombre Completo"
                  rules={[{ required: true, message: 'Por favor ingresa tu nombre completo' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nombre Completo" />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="Correo Electrónico"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu correo electrónico' },
                    { type: 'email', message: 'Por favor ingresa un correo electrónico válido' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Correo Electrónico" />
                </Form.Item>
                
                <Form.Item
                  name="date_of_birth"
                  label="Fecha de Nacimiento"
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    placeholder="Fecha de Nacimiento" 
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item>
                      <Button onClick={() => setEditing(false)}>
                        Cancelar
                      </Button>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        style={{ backgroundColor: '#6a11cb', borderColor: '#6a11cb' }}
                      >
                        Guardar Cambios
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>

          {/* Modal para cambiar contraseña */}
          {changePassword && (
            <Modal
              title="Cambiar Contraseña"
              visible={changePassword}
              onCancel={() => setChangePassword(false)}
              footer={null}
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  name="current_password"
                  label="Contraseña Actual"
                  rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Contraseña Actual" />
                </Form.Item>
                
                <Form.Item
                  name="new_password"
                  label="Nueva Contraseña"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu nueva contraseña' },
                    { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Nueva Contraseña" />
                </Form.Item>
                
                <Form.Item
                  name="confirm_password"
                  label="Confirmar Nueva Contraseña"
                  dependencies={['new_password']}
                  rules={[
                    { required: true, message: 'Por favor confirma tu nueva contraseña' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Las contraseñas no coinciden'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Nueva Contraseña" />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item>
                      <Button onClick={() => setChangePassword(false)}>
                        Cancelar
                      </Button>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        style={{ backgroundColor: '#6a11cb', borderColor: '#6a11cb' }}
                      >
                        Cambiar Contraseña
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          )}
        </TabPane>
        
        <TabPane tab="Actividad" key="activity">
          <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
            <Title level={4}>Historial de Actividad</Title>
            <Paragraph>Aquí se mostrará el historial de actividad del usuario.</Paragraph>
            
            {/* Aquí puedes implementar un componente de timeline o lista de actividades */}
            <Empty 
              description="No hay actividad reciente para mostrar" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;