import { Layout, Menu } from "antd";
import { Link, Outlet } from "react-router-dom";
import { DashboardOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';  // Importamos los iconos de Ant Design

// Desestructuramos los componentes de Layout para usarlos fácilmente
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f4f5f7" }}> {/* Fondo gris suave para toda la aplicación */}
      
      {/* Barra lateral de navegación */}
      <Sider width={80} theme="light" style={{ backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0" }}> {/* Barra lateral blanca y borde gris */}
        <Menu
          theme="light"
          mode="vertical"
          style={{ height: "100%", borderRight: "none", paddingTop: "20px" }}  // Estilo vertical sin borde
        >
          <Menu.Item key="1" icon={<DashboardOutlined />} style={{ fontSize: "18px" }}>
            <Link to="/dashboard">Dashboard</Link>  {/* Enlace al Dashboard */}
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />} style={{ fontSize: "18px" }}>
            <Link to="/profile">Perfil</Link>  {/* Enlace al Perfil */}
          </Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />} style={{ fontSize: "18px" }}>
            <Link to="/settings">Configuraciones</Link>  {/* Enlace a Configuraciones */}
          </Menu.Item>
        </Menu>
      </Sider>
    
      {/* Contenedor principal de la página */}
      <Layout style={{ backgroundColor: "#f4f5f7" }}>
        
        {/* Cabecera del Dashboard */}
        <Header style={{ backgroundColor: "#4e73df", color: "#fff", padding: "20px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <h1 style={{ fontSize: "24px", textAlign: "center", margin: "0" }}>Dashboard</h1>  {/* Título en la cabecera */}
        </Header>

        {/* Contenido principal de la página */}
        <Content style={{ margin: "20px", padding: "30px", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
          <Outlet />  {/* Aquí se renderizarán las páginas secundarias según la ruta */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;  // Exportamos el componente para su uso en otras partes del proyecto
