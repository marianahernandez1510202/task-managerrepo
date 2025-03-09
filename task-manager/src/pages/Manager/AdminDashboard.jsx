// AdminDashboard.jsx - Panel principal para el superadmin
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Button } from 'antd';
import { 
  TeamOutlined, UserOutlined, SettingOutlined, 
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Importar componentes
import GroupManager from './GroupManager';
import UserManagement from './UserManagement';
import authService from '../../services/authService';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Obtener información del usuario actual
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Verificar que sea superadmin
    if (!user || user.role !== 'superadmin') {
      authService.logout();
      navigate('/login');
    }
  }, [navigate]);
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  // Determinar la clave seleccionada en el menú según la ruta actual
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/admin/groups')) return '1';
    if (path.includes('/admin/users')) return '2';
    return '1'; // Por defecto
  };
  
  // Menú de usuario para el header
  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar Sesión
      </Menu.Item>
    </Menu>
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px'
        }}>
          {!collapsed ? 
            <Typography.Title level={4} style={{ margin: 0 }}>
              Panel Admin
            </Typography.Title> : 
            <Avatar icon={<SettingOutlined />} />
          }
        </div>
        <Menu theme="light" mode="inline" defaultSelectedKeys={[getSelectedKey()]}>
          <Menu.Item key="1" icon={<TeamOutlined />}>
            <Link to="/admin/groups">Gestión de Grupos</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to="/admin/users">Gestión de Usuarios</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ 
          padding: 0, 
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ marginRight: 20 }}>
            {currentUser && (
              <Dropdown overlay={userMenu} placement="bottomRight">
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span style={{ marginLeft: 8 }}>{currentUser.full_name}</span>
                </div>
              </Dropdown>
            )}
          </div>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: '4px'
          }}
        >
          <Routes>
            <Route path="/groups" element={<GroupManager />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/" element={<GroupManager />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;