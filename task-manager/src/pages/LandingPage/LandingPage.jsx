// Importamos el componente Button de Ant Design y Link de react-router-dom
import { Button } from "antd"; 
import { Link } from "react-router-dom";

// Definimos el componente funcional LandingPage
const LandingPage = () => {  
  return (
    // Contenedor principal con estilos en línea para centrar el contenido
    <div style={{ textAlign: "center", padding: "50px" }}>
      {/* Título principal de la página */}
      <h1>Bienvenido a nuestra App</h1>  

      {/* Descripción de la página */}
      <p>Explora nuestras funcionalidades iniciando sesión.</p>  

      {/* Enlace para navegar a la página de inicio de sesión */}
      <Link to="/login">  
        {/* Botón estilizado con Ant Design para iniciar sesión */}
        <Button type="primary" size="large">Iniciar Sesión</Button>  
      </Link>
    </div>
  );
};

// Exportamos el componente para que pueda ser usado en otros archivos
export default LandingPage;
