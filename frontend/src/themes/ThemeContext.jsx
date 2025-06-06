import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/Apirest';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const defaultTheme = {
        color_text: '#8A8585', 
        color1: '#071DDC',
        color2: '#ffffff',
    };

    const [theme, setTheme] = useState(defaultTheme);

    const fetchTheme = async () => {
        try {
            const response = await apiClient.get('security/theme/');
            setTheme({
                color_text: response.data.color_text, 
                color1: response.data.color1,
                color2: response.data.color2,
            });
        } catch (error) {
            console.error('Error al obtener el tema:', error);
        }
    };

    const updateTheme = async (newTheme) => {
        try {
            const updatedTheme = { ...theme, ...newTheme };
            setTheme(updatedTheme);
            await apiClient.put('security/theme/', updatedTheme); 
        } catch (error) {
            console.error('Error al actualizar el tema:', error);
        }
    };

    useEffect(() => {
        fetchTheme();
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--text-color', theme.color_text); // Cambiado a color_text
        document.documentElement.style.setProperty('--primary-bg-color', theme.color1);
        document.documentElement.style.setProperty('--secondary-bg-color', theme.color2);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};