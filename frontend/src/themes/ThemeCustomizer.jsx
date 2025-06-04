import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const ThemeCustomizer = () => {
    const { theme, updateTheme } = useContext(ThemeContext);

    return (
        <div>
            <h3>Personalizar Tema</h3>
            <div>
                <label>Color de Texto:</label>
                <input
                    type="color"
                    value={theme.colorText}
                    onChange={(e) => updateTheme({ colorText: e.target.value })}
                />
            </div>
            <div>
                <label>Color Principal:</label>
                <input
                    type="color"
                    value={theme.color1}
                    onChange={(e) => updateTheme({ color1: e.target.value })}
                />
            </div>
            <div>
                <label>Color Secundario:</label>
                <input
                    type="color"
                    value={theme.color2}
                    onChange={(e) => updateTheme({ color2: e.target.value })}
                />
            </div>
        </div>
    );
};

export default ThemeCustomizer;