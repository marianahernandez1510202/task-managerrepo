// src/context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Cargar tema desde localStorage en el renderizado inicial
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const toggleTheme = (isDarkMode) => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    applyTheme(newTheme);
  };
  const styleElement = document.createElement('style');
  styleElement.id = 'dark-select-styles';
  styleElement.textContent = `
    .ant-select-selector {
      background-color: #1f1f1f !important;
      color: white !important;
      border-color: #303030 !important;
    }
    
    .ant-select-selection-item {
      color: white !important;
    }
    
    .ant-select-arrow {
      color: rgba(255, 255, 255, 0.5) !important;
    }
    
    .ant-select-dropdown {
      background-color: #1f1f1f !important;
    }
    
    .ant-select-item {
      color: white !important;
      background-color: #1f1f1f !important;
    }
    
    .ant-select-item-option-active {
      background-color: #303030 !important;
    }
    
    .ant-select-item-option-selected {
      background-color: #6a11cb !important;
    }
  `;
  

  const applyTheme = (theme) => {
    // Aplicar tema al body del documento
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      // Aplicar variables CSS del tema oscuro
      document.documentElement.style.setProperty('--bg-color', '#1f1f1f');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
      document.documentElement.style.setProperty('--card-bg', '#2d2d2d');
      document.documentElement.style.setProperty('--border-color', '#444444');
      
      // Inyectar estilos CSS para el tema oscuro
      const styleElement = document.createElement('style');
      styleElement.id = 'dark-theme-styles';
      styleElement.textContent = `
        /* Estilos para tema oscuro */
        .dark-theme {
          background-color: var(--bg-color);
          color: var(--text-color);
        }
        
        /* Tarjetas */
        .dark-theme .ant-card {
          background-color: var(--card-bg);
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        .dark-theme .ant-card-head {
          background-color: var(--card-bg);
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        /* Layout */
        .dark-theme .ant-layout {
          background-color: var(--bg-color);
        }
        
        .dark-theme .ant-layout-sider {
          background-color: #141414;
        }
        
        .dark-theme .ant-layout-header {
          background-color: #141414;
          color: var(--text-color);
        }
        
        .dark-theme .ant-menu.ant-menu-dark {
          background-color: #141414;
        }
        
        .dark-theme .ant-layout-content {
          background-color: var(--bg-color);
        }
        
        /* Pestañas */
        .dark-theme .ant-tabs-tab {
          color: var(--text-color);
        }
        
        .dark-theme .ant-tabs-content {
          background-color: var(--card-bg);
          color: var(--text-color);
        }
        
        .dark-theme .ant-tabs-nav .ant-tabs-tab-active {
          color: #1890ff;
        }
        
        .dark-theme .ant-tabs-ink-bar {
          background-color: #1890ff;
        }
        
        /* Colapsar */
        .dark-theme .ant-collapse {
          background-color: var(--card-bg);
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        .dark-theme .ant-collapse-content {
          background-color: var(--card-bg);
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        .dark-theme .ant-collapse-header {
          color: var(--text-color) !important;
        }
        
        /* Modales */
        .dark-theme .ant-modal-content,
        .dark-theme .ant-modal-header {
          background-color: var(--card-bg);
          color: var(--text-color);
        }
        
        .dark-theme .ant-modal-title {
          color: var(--text-color);
        }
        
        .dark-theme .ant-modal-close {
          color: var(--text-color);
        }
        
        /* Formularios */
        .dark-theme .ant-form-item-label > label {
          color: var(--text-color);
        }
        
        .dark-theme .ant-input,
        .dark-theme .ant-select-selector,
        .dark-theme .ant-picker,
        .dark-theme .ant-input-number,
        .dark-theme .ant-input-affix-wrapper {
          background-color: #333;
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        .dark-theme .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        
        .dark-theme .ant-select-dropdown {
          background-color: #333;
        }
        
        .dark-theme .ant-select-item {
          color: var(--text-color);
        }
        
        .dark-theme .ant-select-item-option-selected,
        .dark-theme .ant-select-item-option-active {
          background-color: #444;
        }
        
        .dark-theme .ant-picker-panel-container {
          background-color: #333;
        }
        
        .dark-theme .ant-picker-content th,
        .dark-theme .ant-picker-content td {
          color: var(--text-color);
        }
        
        /* Divider */
        .dark-theme .ant-divider {
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        /* Typography */
        .dark-theme .ant-typography {
          color: var(--text-color);
        }
        
        .dark-theme .ant-typography-secondary {
          color: rgba(255, 255, 255, 0.65);
        }
        
        /* Empty */
        .dark-theme .ant-empty-description {
          color: var(--text-color);
        }
        
        /* Botones */
        .dark-theme .ant-btn:not(.ant-btn-primary):not(.ant-btn-dangerous) {
          background-color: #333;
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        /* Radio Buttons */
        .dark-theme .ant-radio-button-wrapper {
          background-color: #333;
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        .dark-theme .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
          background-color: #6a11cb;
          color: white;
          border-color: #6a11cb;
        }
        
        /* List */
        .dark-theme .ant-list-item {
          background-color: var(--card-bg);
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        .dark-theme .ant-list-item-meta-title {
          color: var(--text-color);
        }
        
        .dark-theme .ant-list-item-meta-description {
          color: rgba(255, 255, 255, 0.65);
        }
        
        /* DatePicker */
        .dark-theme .ant-picker-dropdown {
          background-color: #333;
        }
        
        .dark-theme .ant-picker-cell {
          color: var(--text-color);
        }
        
        .dark-theme .ant-picker-header {
          color: var(--text-color);
          border-color: var(--border-color);
        }
        
        .dark-theme .ant-picker-header button {
          color: var(--text-color);
        }
        
        .dark-theme .ant-picker-content th {
          color: var(--text-color);
        }
        
        .dark-theme .ant-picker-cell-in-view {
          color: var(--text-color);
        }
        
        /* Float Button */
        .dark-theme .ant-float-btn {
          background-color: #6a11cb;
        }
        
        .dark-theme .ant-float-btn-body {
          background-color: #6a11cb;
        }
          // Añadir estos estilos adicionales en el archivo ThemeContext.js, 
// dentro de la función applyTheme, en la sección de estilos del tema oscuro:

/* Layout Components */
.dark-theme .ant-layout {
  background-color: #0d0d0d;
}

.dark-theme .ant-layout-sider {
  background-color: #141414;
}

.dark-theme .ant-layout-header {
  background-color: #141414;
  color: #fff;
}

.dark-theme .ant-layout-content {
  background-color: #1f1f1f;
}

/* Menu in dark mode */
.dark-theme .ant-menu.ant-menu-dark,
.dark-theme .ant-menu-dark .ant-menu-sub,
.dark-theme .ant-menu.ant-menu-dark .ant-menu-item-selected,
.dark-theme .ant-menu-dark .ant-menu-item-selected > a,
.dark-theme .ant-menu-dark .ant-menu-item-selected > span > a {
  background-color: #141414;
}

.dark-theme .ant-menu-dark .ant-menu-item,
.dark-theme .ant-menu-dark .ant-menu-item-group-title,
.dark-theme .ant-menu-dark .ant-menu-item > a {
  color: rgba(255, 255, 255, 0.65);
}

.dark-theme .ant-menu-dark .ant-menu-item-selected {
  background-color: #6a11cb;
}
/* Estilos para el selector en sí mismo (no el dropdown) */
.ant-select-dark .ant-select-selector {
  background-color: #1f1f1f !important;
  color: white !important;
  border-color: #303030 !important;
}

/* Color del texto seleccionado */
.ant-select-dark .ant-select-selection-item {
  color: white !important;
}

/* Color del placeholder */
.ant-select-dark .ant-select-selection-placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* Color del icono de la flecha */
.ant-select-dark .ant-select-arrow {
  color: rgba(255, 255, 255, 0.5) !important;
}
/* Dropdown menu */
.dark-theme .ant-dropdown-menu {
  background-color: #1f1f1f;
  border: 1px solid #333;
}

.dark-theme .ant-dropdown-menu-item {
  color: #fff;
}

.dark-theme .ant-dropdown-menu-item:hover {
  background-color: #333;
}

/* Button styles */
.dark-theme .ant-btn {
  background-color: #333;
  border-color: #444;
  color: #fff;
}

.dark-theme .ant-btn-text {
  background-color: transparent;
  border-color: transparent;
}

.dark-theme .ant-btn-primary {
  background-color: #6a11cb;
  border-color: #6a11cb;
}
  // Estilos muy específicos para los dropdowns de Select
.ant-select-dropdown {
  background-color: #1f1f1f !important;
}

.ant-select-dropdown .ant-select-item {
  color: white !important;
}

.ant-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background-color: #303030 !important;
}

.ant-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background-color: #6a11cb !important;
}

.ant-select-dropdown .ant-empty-description {
  color: white !important;
}

// Para el DatePicker dropdown
.ant-picker-dropdown {
  background-color: #1f1f1f !important;
}

.ant-picker-dropdown .ant-picker-header {
  color: white !important;
  border-color: #303030 !important;
}

.ant-picker-dropdown .ant-picker-header button {
  color: white !important;
}

.ant-picker-dropdown .ant-picker-cell {
  color: rgba(255, 255, 255, 0.7) !important;
}

.ant-picker-dropdown .ant-picker-cell-in-view {
  color: white !important;
}

.ant-picker-dropdown .ant-picker-cell-selected .ant-picker-cell-inner {
  background-color: #6a11cb !important;
}
  /* Estilos para el dropdown de Select */
.ant-select-dropdown.ant-select-dropdown-dark,
.ant-select-dropdown-dark {
  background-color: #1f1f1f !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
}

/* Todos los items del dropdown */
.ant-select-dropdown.ant-select-dropdown-dark .ant-select-item,
.ant-select-dropdown-dark .ant-select-item {
  color: white !important;
  background-color: #1f1f1f !important;
}

/* Item activo (hover) */
.ant-select-dropdown.ant-select-dropdown-dark .ant-select-item-option-active,
.ant-select-dropdown-dark .ant-select-item-option-active {
  background-color: #303030 !important;
  color: white !important;
}

/* Item seleccionado */
.ant-select-dropdown.ant-select-dropdown-dark .ant-select-item-option-selected,
.ant-select-dropdown-dark .ant-select-item-option-selected {
  background-color: #6a11cb !important;
  color: white !important;
}

/* La primera opción seleccionada */
.ant-select-dropdown.ant-select-dropdown-dark .ant-select-item-option:first-child,
.ant-select-dropdown-dark .ant-select-item-option:first-child {
  background-color: #1f1f1f !important;
  color: white !important;
}

/* Cuando está seleccionada la primera opción */
.ant-select-dropdown.ant-select-dropdown-dark .ant-select-item-option:first-child.ant-select-item-option-selected,
.ant-select-dropdown-dark .ant-select-item-option:first-child.ant-select-item-option-selected {
  background-color: #6a11cb !important;
}

/* Para cualquier select abierto */
.ant-select-open + .ant-select-dropdown,
.ant-select-dropdown--single {
  background-color: #1f1f1f !important;
}

/* También estilo para el dropdown selector en sí */
.ant-select-selector {
  background-color: #1f1f1f !important;
  color: white !important;
  border-color: #303030 !important;
}
      `;
      
      // Eliminar estilos anteriores si existen
      const existingStyles = document.getElementById('dark-theme-styles');
      if (existingStyles) {
        existingStyles.remove();
      }
      
      document.head.appendChild(styleElement);
    } else {
      document.body.classList.remove('dark-theme');
      
      // Restablecer a variables CSS del tema claro
      document.documentElement.style.setProperty('--bg-color', '#ffffff');
      document.documentElement.style.setProperty('--text-color', '#000000');
      document.documentElement.style.setProperty('--card-bg', '#ffffff');
      document.documentElement.style.setProperty('--border-color', '#d9d9d9');
      
      // Eliminar estilos de tema oscuro
      const darkThemeStyles = document.getElementById('dark-theme-styles');
      if (darkThemeStyles) {
        darkThemeStyles.remove();
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};