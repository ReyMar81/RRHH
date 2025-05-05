import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Inicializar useNavigate

    // Lista de usuarios válidos
    const validUsers = {
        admin: 'admin123',
        fernando: 'fernando123',
        reymar: 'reymar123',
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar credenciales
        if (validUsers[username] && validUsers[username] === password) {
            console.log('Login exitoso:', username);
            setErrorMessage('');
            navigate('/dashboard'); // Redirigir al Dashboard
        } else {
            setErrorMessage('Nombre de usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo">
                </div>

                <h1 className="welcome-text">¡Bienvenido, a RRHH!</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <span className="icon user-icon">👤</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="icon password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <button type="submit" className="login-button">
                        INICIAR SESIÓN
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;