// Importamos los componentes necesarios de Ant Design y React Router
import { Layout, Menu } from "antd";  // Layout estructura la página, Menu crea la barra de navegación lateral
import { Link, Outlet } from "react-router-dom";  // Link permite la navegación sin recargar la página, Outlet renderiza rutas hijas

// Desestructuramos los componentes de Layout para usarlos fácilmente
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>  {/* Contenedor principal con altura completa de la ventana */}
      
      {/* Barra lateral de navegación */}
      <Sider theme="dark">  
        <Menu theme="dark" mode="inline">  {/* Menú con estilo oscuro y disposición en línea */}
          <Menu.Item key="1">  {/* Opción del menú con clave única */}
            <Link to="/dashboard">Dashboard</Link>  {/* Enlace a la página del Dashboard */}
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/profile">Perfil</Link>  {/* Enlace a la página de perfil */}
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/settings">Configuraciones</Link>  {/* Enlace a la página de configuraciones */}
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Contenedor principal de la página */}
      <Layout>
        {/* Cabecera del Dashboard */}
        <Header style={{ background: "#1890ff", color: "#fff", textAlign: "center" }}>
          <h1>Dashboard</h1>  {/* Título en la cabecera */}
        </Header>

        {/* Contenido principal de la página */}
        <Content style={{ margin: "16px", padding: "20px", background: "#fff" }}>
          <Outlet />  {/* Aquí se renderizarán las páginas secundarias según la ruta */}
        </Content>
      </Layout>

    </Layout>
  );
};

export default MainLayout;  // Exportamos el componente para su uso en otras partes del proyecto
