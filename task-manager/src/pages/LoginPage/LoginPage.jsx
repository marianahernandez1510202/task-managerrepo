// Importamos los hooks useState y useNavigate, así como los componentes necesarios de Ant Design
import { useState } from "react";
import { Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";

// Definimos una lista de usuarios con credenciales válidas para autenticación
const users = [
  { username: "admin", password: "1234" },
  { username: "user", password: "5678" }
];

// Definimos el componente funcional LoginPage
const LoginPage = () => {
  // Estado para manejar las credenciales ingresadas por el usuario
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  // Estado para manejar el mensaje de error en caso de credenciales incorrectas
  const [error, setError] = useState("");
  // Hook para navegar a otras páginas dentro de la aplicación
  const navigate = useNavigate();

  // Función para manejar el inicio de sesión
  const handleLogin = () => {
    // Verifica si las credenciales ingresadas coinciden con algún usuario en la lista
    const validUser = users.find(user => user.username === credentials.username && user.password === credentials.password);
    if (validUser) {
      // Si las credenciales son correctas, redirige al usuario al dashboard
      navigate("/dashboard");
    } else {
      // Si las credenciales son incorrectas, muestra un mensaje de error
      setError("Credenciales incorrectas");
    }
  };

  return (
    // Contenedor principal con estilos para centrar el formulario en la pantalla
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {/* Tarjeta de Ant Design que contiene el formulario de inicio de sesión */}
      <Card title="Iniciar Sesión" style={{ width: 300 }}>
        {/* Campo de entrada para el nombre de usuario */}
        <Input 
          placeholder="Usuario" 
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        {/* Campo de entrada para la contraseña con ocultación de caracteres */}
        <Input.Password 
          placeholder="Contraseña" 
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        {/* Muestra el mensaje de error si las credenciales son incorrectas */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* Botón para iniciar sesión */}
        <Button type="primary" onClick={handleLogin} block>Ingresar</Button>
      </Card>
    </div>
  );
};

// Exportamos el componente para que pueda ser utilizado en otros archivos
export default LoginPage;
