// pages/LoginPage/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import authService from "../../services/authService";

const { Title, Text } = Typography;

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Extraer email y password del objeto values
      const { email, password } = values;
      
      // Llamar al servicio de autenticación con los valores individuales
      const response = await authService.login(email, password);
      
      if (response.success) {
        message.success("Inicio de sesión exitoso");
        const token = response.token;
        const userData = response.user;
        
        // Almacenar datos en localStorage y estado
        localStorage.setItem("token", token);
        if (onLogin) {
          onLogin(userData, token);
        }
        
        // Redireccionar según el rol del usuario
        if (userData.role === 'superadmin') {
          navigate("/admin/groups");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        message.error(response.message || "Error en el inicio de sesión");
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      const errorMessage = error.response?.data?.message || "Error en el inicio de sesión. Verifica tus credenciales.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #6a11cb, #2575fc)", // Degradado azul-púrpura
      }}
    >
      <Card
        style={{
          width: 400,
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
          background: "#fff",
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: 20, color: "#6a11cb" }}>
          Iniciar sesión
        </Title>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Correo electrónico</Text>}
            name="email"
            rules={[
              { required: true, message: "Ingresa tu correo" },
              { type: "email", message: "Correo inválido" },
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="Ingresa tu correo" 
              size="large" 
            />
          </Form.Item>
          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Contraseña</Text>}
            name="password"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Ingresa tu contraseña" 
              size="large" 
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              loading={loading} 
              style={{ fontWeight: "bold", background: "#6a11cb", borderColor: "#6a11cb" }}
            >
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
        <Text style={{ display: "block", textAlign: "center", marginTop: "12px", color: "#6a11cb" }}>
  ¿No tienes cuenta?  
  <Button 
    type="link" 
    onClick={() => navigate('/register')} 
    style={{ fontWeight: 'bold', color: '#1890ff' }}
  >
    Registrarse
  </Button>
</Text>

      </Card>
    </div>
  );
};

export default LoginPage;