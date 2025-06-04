import React, { useState } from 'react';
import axios from 'axios';
import { Apiurl } from '../../services/Apirest';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Archivo CSS para estilos personalizados

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${Apiurl}security/token/`, formData);
            // Guardar los tokens en el almacenamiento local
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div className="login-container d-flex justify-content-center align-items-center min-vh-100">
            <div className="login-card card p-4 shadow-lg">
                <h3 className="text-center mb-4 ">Bienvenido</h3>
                <form onSubmit={handleSubmit}>
                    {/* Mostrar mensaje de error */}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Usuario */}
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-control text-black"
                            placeholder="Ingrese su usuario"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="username">Usuario</label>
                    </div>

                    {/* Contraseña */}
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control text-black"
                            placeholder="Ingrese su contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="password">Contraseña</label>
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary btn-lg">
                            Iniciar sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;