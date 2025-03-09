// pages/LandingPage/LandingPage.jsx
import React from 'react';
import { Layout, Button, Typography, Row, Col, Card, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  DashboardOutlined,
  UserOutlined,
  LockOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <Layout className="landing-page">
      <Header style={{ 
        background: 'transparent', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 50px',
        position: 'fixed',
        zIndex: 1,
        width: '100%',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <DashboardOutlined style={{ fontSize: '32px', color: '#6a11cb' }} />
          <Title level={3} style={{ margin: '0 0 0 12px', color: '#6a11cb' }}>
            TaskManager
          </Title>
        </div>
        <div>
          <Button 
            type="text" 
            onClick={() => navigate('/login')}
            style={{ marginRight: '15px', color: '#6a11cb', fontWeight: '500' }}
          >
            Iniciar Sesión
          </Button>
          <Button 
            type="primary" 
            onClick={() => navigate('/register')}
            style={{ background: '#6a11cb', borderColor: '#6a11cb', fontWeight: '500' }}
          >
            Registrarse
          </Button>
        </div>
      </Header>
      
      <Content style={{ marginTop: '64px' }}>
        {/* Hero Section */}
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 50px',
          background: 'linear-gradient(135deg, #6a11cb20, #2575fc20)',
        }}>
          <Title style={{ fontSize: '48px', marginBottom: '24px', color: '#6a11cb' }}>
            Administra tareas de forma eficiente
          </Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '800px', marginBottom: '40px' }}>
            Plataforma integral para que profesores y administradores organicen grupos, 
            asignen tareas y realicen seguimiento del progreso de los estudiantes.
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/register')}
            style={{ 
              height: '50px', 
              padding: '0 40px', 
              fontSize: '18px',
              background: '#6a11cb',
              borderColor: '#6a11cb'
            }}
          >
            Comenzar Ahora
          </Button>
        </div>
        
        {/* Features Section */}
        <div style={{ padding: '80px 50px', background: '#fff' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '60px', color: '#6a11cb' }}>
            Características Principales
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable 
                style={{ height: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cover={
                  <div style={{ 
                    background: '#6a11cb', 
                    height: '120px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                  }}>
                    <TeamOutlined style={{ fontSize: '48px', color: '#fff' }}/>
                  </div>
                }
              >
                <Title level={4}>Gestión de Grupos</Title>
                <Paragraph>
                  Crea y administra grupos de estudiantes. Organiza a los participantes
                  de manera efectiva para asignar tareas específicas.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable 
                style={{ height: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cover={
                  <div style={{ 
                    background: '#2575fc', 
                    height: '120px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                  }}>
                    <CalendarOutlined style={{ fontSize: '48px', color: '#fff' }}/>
                  </div>
                }
              >
                <Title level={4}>Administración de Tareas</Title>
                <Paragraph>
                  Asigna tareas con fechas límite, seguimiento de progreso y
                  notificaciones automáticas para mantener a todos informados.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable 
                style={{ height: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cover={
                  <div style={{ 
                    background: '#8e44ad', 
                    height: '120px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                  }}>
                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#fff' }}/>
                  </div>
                }
              >
                <Title level={4}>Seguimiento de Progreso</Title>
                <Paragraph>
                  Los estudiantes pueden marcar tareas como completadas y los administradores
                  pueden verificar el progreso general de todos los participantes.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
        
        {/* Roles Section */}
        <div style={{ 
          padding: '80px 50px', 
          background: 'linear-gradient(135deg, #6a11cb10, #2575fc10)' 
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '60px', color: '#6a11cb' }}>
            Roles en la Plataforma
          </Title>
          <Row gutter={[48, 48]} justify="center" align="middle">
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <UserOutlined style={{ fontSize: '48px', color: '#6a11cb' }} />
                </div>
                <Title level={3} style={{ textAlign: 'center', color: '#6a11cb' }}>
                  Super Administrador
                </Title>
                <Divider />
                <ul style={{ fontSize: '16px', paddingLeft: '20px' }}>
                  <li>Crear y gestionar grupos</li>
                  <li>Asignar estudiantes a grupos</li>
                  <li>Crear y asignar tareas</li>
                  <li>Verificar el progreso de los estudiantes</li>
                  <li>Administrar usuarios del sistema</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <UserOutlined style={{ fontSize: '48px', color: '#2575fc' }} />
                </div>
                <Title level={3} style={{ textAlign: 'center', color: '#2575fc' }}>
                  Estudiante
                </Title>
                <Divider />
                <ul style={{ fontSize: '16px', paddingLeft: '20px' }}>
                  <li>Ver grupos asignados</li>
                  <li>Ver tareas pendientes</li>
                  <li>Marcar tareas como completadas</li>
                  <li>Visualizar fechas límite</li>
                  <li>Seguimiento de progreso personal</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </div>
        
        {/* CTA Section */}
        <div style={{ 
          padding: '100px 50px', 
          background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
          textAlign: 'center',
          color: 'white'
        }}>
          <Title style={{ color: 'white', marginBottom: '24px', fontSize: '36px' }}>
            ¿Listo para empezar?
          </Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 40px' }}>
            Regístrate ahora y comienza a gestionar tus tareas y grupos de manera eficiente.
            Una plataforma diseñada para mejorar la productividad educativa.
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/register')}
            style={{ 
              height: '50px', 
              padding: '0 40px', 
              fontSize: '18px',
              background: 'white',
              borderColor: 'white',
              color: '#6a11cb',
              fontWeight: 'bold'
            }}
          >
            Crear Cuenta
          </Button>
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', padding: '24px' }}>
        TaskManager ©{new Date().getFullYear()} - Sistema de Gestión de Tareas
      </Footer>
    </Layout>
  );
};

export default LandingPage;