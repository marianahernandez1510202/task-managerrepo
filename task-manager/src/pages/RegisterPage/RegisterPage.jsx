// pages/RegisterPage/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, DatePicker, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        ...values,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD')
      });
      
      message.success('Registro exitoso, ahora puedes iniciar sesión');
      navigate('/login');
    } catch (error) {
      console.error('Error en registro:', error);
      message.error('Error al registrar. ' + (error.response?.data?.message || 'Inténtalo de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #6a11cb, #2575fc)', // Degradado azul-púrpura
      }}
    >
      <Card
        style={{
          width: 450,
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
          background: '#fff',
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 20, color: '#6a11cb' }}>
          Registro de Usuario
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Nombre Completo</Text>}
            name="full_name"
            rules={[{ required: true, message: 'Por favor ingresa tu nombre completo' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nombre Completo" />
          </Form.Item>

          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Correo Electrónico</Text>}
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu correo electrónico' },
              { type: 'email', message: 'Por favor ingresa un correo electrónico válido' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Correo Electrónico" />
          </Form.Item>

          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Fecha de Nacimiento</Text>}
            name="date_of_birth"
            rules={[{ required: true, message: 'Por favor selecciona tu fecha de nacimiento' }]}
          >
            <DatePicker
              prefix={<CalendarOutlined />}
              style={{ width: '100%' }}
              placeholder="Fecha de Nacimiento"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Contraseña</Text>}
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>

          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Confirmar Contraseña</Text>}
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma tu contraseña' },
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
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Contraseña" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%', fontWeight: "bold", background: "#6a11cb", borderColor: "#6a11cb" }}
              loading={loading}
            >
              Registrarse
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#6a11cb' }}>
              ¿Ya tienes una cuenta? <a href="/login" style={{ fontWeight: 'bold', color: '#1890ff' }}>Inicia Sesión</a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;