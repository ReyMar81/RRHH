// src/contexts/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

// Definimos los temas disponibles
const themes = {
    light: {
        name: 'light',
        colors: {
            primary: '#0077B6', // Azul principal
            secondary: '#00B4D8', // Azul claro
            success: '#90E0EF', // Azul pastel
            danger: '#e74c3c', // Rojo (sin cambios)
            warning: '#f39c12', // Amarillo (sin cambios)
            info: '#CAF0F8', // Azul muy claro
            light: '#CAF0F8', // Fondo claro
            dark: '#03045E', // Azul oscuro
            background: '#CAF0F8', // Fondo general
            text: '#03045E', // Texto oscuro
            sidebarBg: '#90E0EF', // Fondo de la barra lateral
            sidebarText: '#03045E', // Texto de la barra lateral
            navbarBg: '#0077B6', // Fondo del navbar
            navbarText: '#ffffff', // Texto del navbar
        },
        fonts: {
            primary: "'Roboto', sans-serif",
            secondary: "'Open Sans', sans-serif",
        }
    },
    dark: {
        name: 'dark',
        colors: {
            primary: '#0077B6', // Azul principal
            secondary: '#00B4D8', // Azul claro
            success: '#90E0EF', // Azul pastel
            danger: '#e74c3c', // Rojo (sin cambios)
            warning: '#f39c12', // Amarillo (sin cambios)
            info: '#CAF0F8', // Azul muy claro
            light: '#90E0EF', // Fondo claro
            dark: '#03045E', // Azul oscuro
            background: '#03045E', // Fondo general
            text: '#CAF0F8', // Texto claro
            sidebarBg: '#0077B6', // Fondo de la barra lateral
            sidebarText: '#CAF0F8', // Texto de la barra lateral
            navbarBg: '#03045E', // Fondo del navbar
            navbarText: '#CAF0F8', // Texto del navbar
        },
        fonts: {
            primary: "'Roboto', sans-serif",
            secondary: "'Open Sans', sans-serif",
        }
    }
};

// Creamos el contexto
const ThemeContext = createContext();

// Hook personalizado para usar el contexto del tema
export const useTheme = () => useContext(ThemeContext);

// Proveedor del contexto
export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(themes.light);

    const toggleTheme = () => {
        setCurrentTheme(currentTheme.name === 'light' ? themes.dark : themes.light);
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};