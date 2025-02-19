// Importamos los componentes necesarios de react-router-dom para la navegación
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importamos las páginas que se utilizarán en la aplicación
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import MainLayout from "./layouts/MainLayout";
import Register from "./pages/RegisterPage/RegisterPage";

// Definimos el componente principal App
const App = () => {
  return (
    // Envolvemos la aplicación dentro del Router para manejar la navegación
    <Router>
      <Routes>
        {/* Ruta principal que muestra la página de inicio (LandingPage) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />

        {/* Ruta para la página de inicio de sesión */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta para el dashboard, utilizando el MainLayout como contenedor */}
        <Route path="/dashboard" element={<MainLayout />}>
          {/* Página de inicio dentro del dashboard */}
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

// Exportamos el componente App para que sea utilizado en el proyecto
export default App;
