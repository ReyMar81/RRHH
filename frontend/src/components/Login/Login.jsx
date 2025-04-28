import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Attempting login with:', username, password);
        // Add your authentication logic here
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

                    <button type="submit" className="login-button">
                        INICIAR SESIÓN
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Login;