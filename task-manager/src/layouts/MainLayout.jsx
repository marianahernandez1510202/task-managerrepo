// layouts/MainLayout.jsx
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Layout, Menu, Avatar, Dropdown, Button, Typography } from 'antd';
import { 
  MenuUnfoldOutlined, MenuFoldOutlined, 
  TeamOutlined, UserOutlined, SettingOutlined,
  DashboardOutlined, ProfileOutlined, LogoutOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  
  const isDarkMode = theme === 'dark';

  // Determinar la clave seleccionada en el menú según la ruta actual
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/dashboard') return '1';
    if (path.includes('/dashboard/groups')) return '2';
    if (path.includes('/dashboard/users')) return '3';
    if (path.includes('/dashboard/profile')) return '4';
    if (path.includes('/dashboard/settings')) return '5';
    return '1'; // Por defecto
  };

  // Menú de usuario para el header
  const userMenu = (
    <Menu className={isDarkMode ? 'dark-theme' : ''}>
      <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={() => navigate('/dashboard/profile')}>
        Perfil
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/dashboard/settings')}>
        Configuración
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        Cerrar Sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={isDarkMode ? 'dark-theme' : ''}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          theme={isDarkMode ? "dark" : "light"}
          style={{
            backgroundColor: isDarkMode ? '#141414' : '#fff',
          }}
        >
          <div style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: isDarkMode ? '#141414' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit'
          }}>
            {!collapsed ? 
              <Typography.Title level={4} style={{ margin: 0, color: isDarkMode ? '#fff' : 'inherit' }}>
                Task Manager
              </Typography.Title> : 
              <Avatar icon={<SettingOutlined />} />
            }
          </div>
          <Menu 
            theme={isDarkMode ? "dark" : "light"} 
            mode="inline" 
            defaultSelectedKeys={[getSelectedKey()]}
            selectedKeys={[getSelectedKey()]}
            style={{
              backgroundColor: isDarkMode ? '#141414' : '#fff',
            }}
          >
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>
            
            {/* Menú solo para superadmin */}
            {user?.role === 'superadmin' && (
              <>
                <Menu.Item key="3" icon={<UserOutlined />}>
                  <Link to="/dashboard/users">Gestión de Usuarios</Link>
                </Menu.Item>
              </>
            )}
            
            <Menu.Item key="4" icon={<ProfileOutlined />}>
              <Link to="/dashboard/profile">Perfil</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<SettingOutlined />}>
              <Link to="/dashboard/settings">Configuración</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header 
            style={{ 
              padding: 0, 
              background: isDarkMode ? '#141414' : '#fff',
              color: isDarkMode ? '#fff' : 'inherit',
              boxShadow: '0 1px 4px rgba(0,21,41,.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                fontSize: '16px', 
                width: 64, 
                height: 64,
                color: isDarkMode ? '#fff' : 'inherit' 
              }}
            />
            <div style={{ marginRight: 20 }}>
              {user && (
                <Dropdown overlay={userMenu} placement="bottomRight">
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <Avatar 
                      style={{ backgroundColor: '#1890ff' }}
                      icon={<UserOutlined />} 
                    />
                    <Text style={{ 
                      marginLeft: 8,
                      color: isDarkMode ? '#fff' : 'inherit'
                    }}>
                      {user.full_name || user.email}
                      <small style={{ 
                        display: 'block', 
                        color: isDarkMode ? '#aaaaaa' : '#666' 
                      }}>
                        {user.role === 'superadmin' ? 'Administrador' : 'Estudiante'}
                      </small>
                    </Text>
                  </div>
                </Dropdown>
              )}
            </div>
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: isDarkMode ? '#1f1f1f' : '#fff',
              color: isDarkMode ? '#fff' : 'inherit',
              borderRadius: '4px',
              overflow: 'auto'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default MainLayout;