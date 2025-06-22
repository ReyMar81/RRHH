import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/Apirest';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const defaultTheme = {
        color_text: '#8A8585', 
        color1: '#071DDC',
        color2: '#ffffff',
        font_size: '16px',
        font_family: 'Arial, sans-serif',
    };

    const [theme, setTheme] = useState(defaultTheme);

    const fetchTheme = async () => {
        try {
            const response = await apiClient.get('security/theme/');
            setTheme({
                color_text: response.data.colorText, 
                color1: response.data.color1,
                color2: response.data.color2,
                font_size: response.data.fontSize,
                font_family: response.data.fontFamily,
            });
        } catch (error) {
            console.error('Error al obtener el tema:', error);
        }
    };

    const updateTheme = async (newTheme) => {
        // Actualiza el estado local primero para reflejar el cambio inmediato
        const updatedTheme = { ...theme, ...newTheme };
        setTheme(updatedTheme);

        try {
            await apiClient.put('security/theme/', {
                color_text: updatedTheme.color_text,
                color1: updatedTheme.color1,
                color2: updatedTheme.color2,
                font_size: updatedTheme.font_size,
                font_family: updatedTheme.font_family,
            });
        } catch (error) {
            console.error('Error al actualizar el tema:', error);
        }
    };

    useEffect(() => {
        fetchTheme();
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--text-color', theme.color_text);
        document.documentElement.style.setProperty('--primary-bg-color', theme.color1);
        document.documentElement.style.setProperty('--secondary-bg-color', theme.color2);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};