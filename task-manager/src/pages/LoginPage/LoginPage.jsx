import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Input, Button, Typography, Card, message } from "antd";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/login", values);
      if (response.data.success) {
        message.success("Inicio de sesión exitoso");
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error en el inicio de sesión. Inténtalo nuevamente.");
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
        background: "linear-gradient(135deg, #6a11cb, #2575fc)", // Nuevo degradado azul-púrpura
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
            <Input placeholder="Ingresa tu correo" size="large" />
          </Form.Item>
          <Form.Item
            label={<Text style={{ fontWeight: 600 }}>Contraseña</Text>}
            name="password"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password placeholder="Ingresa tu contraseña" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ fontWeight: "bold" }}>
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
        <Text style={{ display: "block", textAlign: "center", marginTop: "12px", color: "#6a11cb" }}>
          ¿No tienes cuenta? <a href="/register" style={{ fontWeight: "bold", color: "#1890ff" }}>Registrarse</a>
        </Text>
      </Card>
    </div>
  );
};

export default LoginPage;
