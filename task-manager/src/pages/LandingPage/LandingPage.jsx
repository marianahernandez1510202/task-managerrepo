import { Button } from "antd"; 
import { Link } from "react-router-dom";

// Definimos el componente funcional LandingPage
const LandingPage = () => {  
  return (
    // Contenedor principal con estilos modernos y coloridos
    <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#f0f8ff", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
      {/* Título principal de la página con un color llamativo */}
      <h1 style={{ color: "#1E90FF", fontSize: "48px", fontFamily: "Arial, sans-serif" }}>Bienvenido</h1>  

      {/* Descripción de la página con un toque amistoso */}
      <p style={{ fontSize: "18px", color: "#32CD32", fontFamily: "Comic Sans MS", marginBottom: "30px" }}>Explora nuestras funcionalidades iniciando sesión.</p>  

      {/* Enlace para navegar a la página de inicio de sesión */}
      <Link to="/login">  
        {/* Botón estilizado con Ant Design para iniciar sesión */}
        <Button 
          type="primary" 
          size="large" 
          style={{ 
            backgroundColor: "#ff6347", 
            borderColor: "#ff6347", 
            fontSize: "18px", 
            fontWeight: "bold", 
            padding: "10px 30px", 
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(255, 99, 71, 0.5)" 
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#ff4500"} // Efecto hover
          onMouseLeave={(e) => e.target.style.backgroundColor = "#ff6347"} // Efecto hover revertido
        >
          Iniciar Sesión
        </Button>  
      </Link>
    </div>
  );
};

// Exportamos el componente para que pueda ser usado en otros archivos
export default LandingPage;
