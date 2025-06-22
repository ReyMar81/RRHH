import React, { useState } from 'react';
import axios from 'axios';
import { Apiurl } from '../../services/Apirest';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
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
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Decodificar el token para saber si es superadmin
            const decoded = jwtDecode(response.data.access);
            console.log("Token decodificado:", decoded); // <-- Ya tienes esto
            console.log("¿Es superusuario?:", decoded.is_superuser); // <-- Agrega esta línea

            if (decoded.is_superuser === true) {
                navigate('/admindashboard');
                return; // Esto detiene la función aquí
            }

            // Si no es superadmin, buscar empresa y redirigir a dashboard
            const empresaResponse = await axios.get(`${Apiurl}empresas/`, {
                headers: {
                    Authorization: `Bearer ${response.data.access}`,
                },
            });

            if (empresaResponse.data.length > 0) {
                localStorage.setItem('empresa_id', empresaResponse.data[0].id);
                navigate('/dashboard');
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } else {
                setError('No tiene empresa asociada.');
            }
        } catch (error) {
            setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div className="login-container d-flex justify-content-center align-items-center min-vh-100">
            <div className="login-card card p-4 shadow-lg">
                <h3 className="text-center mb-4 ">Bienvenido a HRM System</h3>
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