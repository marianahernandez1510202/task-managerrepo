// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/lib/locale/es_ES';

// Importación de componentes
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage/LoginPage';
import Register from './pages/RegisterPage/RegisterPage';
import GroupManager from './pages/Manager/GroupManager';
import UserManagement from './pages/Manager/UserManagement';
import StudentDashboard from './pages/Dashboard/DashboardPage';
import Profile from './pages/user/profile';
import Settings from './pages/user/settings';
import LandingPage from './pages/LandingPage/LandingPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la aplicación
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Función para manejar el login
  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <ConfigProvider locale={esES}>
      <Router>
        <Routes>
          {/* Ruta de landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rutas públicas */}
          <Route path="/login" element={
            !user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />
          } />
          <Route path="/register" element={
            !user ? <Register /> : <Navigate to="/dashboard" />
          } />

          {/* Rutas protegidas dentro del layout principal */}
          <Route path="/dashboard" element={
            user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
          }>
            <Route index element={
              user?.role === 'superadmin' ? <GroupManager /> : <StudentDashboard />
            } />
            {/* Rutas exclusivas para super administrador */}
            {user?.role === 'superadmin' && (
              <Route path="users" element={<UserManagement />} />
            )}
            <Route path="profile" element={<Profile user={user} />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Ruta para cualquier otra dirección no definida */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;